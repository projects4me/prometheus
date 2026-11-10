/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
import ENV from 'prometheus/config/environment';
import Logger from 'js-logger';
import LocalStorageStore, { SESSION_STORAGE_KEY } from 'prometheus/session-stores/local-storage';
import EphemeralStore from 'prometheus/session-stores/ephemeral';
import {
    DEFAULT_POST_AUTH_ROUTE,
    resolvePostAuthDestination,
} from 'prometheus/utils/auth/post-auth-destination';
import { logAuthEvent } from 'prometheus/utils/auth/auth-log';

/** Refresh when the access token expires within this window (ms). */
export const REFRESH_WINDOW_MS = 60 * 1000;

const CROSS_TAB_LOCK_NAME = 'prometheus-oauth-token-refresh';

/**
 * Fallback cross-tab lock when `navigator.locks` is unavailable. Uses a
 * timestamp in localStorage; stale locks older than {@link LS_LOCK_TTL_MS} are
 * ignored. This is best-effort only (no strict mutual exclusion under race).
 *
 * @constant {String} LS_LOCK_KEY
 */
const LS_LOCK_KEY ='prometheus_oauth_token_refresh_lock';
const LS_LOCK_TTL_MS = 30 * 1000;
const LS_LOCK_POLL_MS = 50;

const SESSION_CONFIG = ENV.session || {};
const IS_TEST = ENV.environment === 'test';

/**
 * The session: authentication state, the session lifecycle (restore,
 * authenticate, invalidate, cross-tab sync), the route guards, and OAuth
 * refresh_token grants (in-tab single-flight and cross-tab locking).
 * Password login is delegated to `authenticator:oauth2`; persistence to a
 * session store (`session-stores/`).
 *
 * Call `setup()` first in the application route's beforeModel: it restores the
 * persisted session and enables the handlers that route the user after
 * sign-in and reload the app after sign-out.
 *
 * The persisted shape is the one ember-simple-auth wrote:
 * `{ authenticated: { authenticator: 'authenticator:oauth2', access_token, refresh_token, expires_at, ... } }`.
 *
 * @class SessionService
 * @namespace Prometheus.Services
 * @extends Service
 * @public
 */
export default class SessionService extends Service {
    @service router;

    /**
     * Whether the session is authenticated.
     *
     * @property isAuthenticated
     * @type Boolean
     * @public
     */
    @tracked isAuthenticated = false;

    /**
     * The session data; `data.authenticated` holds the authenticator's data
     * (tokens and expiry). Replaced, never mutated, so readers re-render.
     *
     * @property data
     * @type Object
     * @public
     */
    @tracked data = { authenticated: {} };

    /**
     * The name of the authenticator that authenticated the session.
     *
     * @property authenticator
     * @type String
     * @public
     */
    authenticator = null;

    /**
     * The transition intercepted by `requireAuthentication`; retried after sign-in.
     *
     * @property attemptedTransition
     * @type Transition
     * @public
     */
    attemptedTransition = null;

    /**
     * Where the session is persisted.
     *
     * @property store
     * @type LocalStorageStore|EphemeralStore
     * @public
     */
    store = null;

    _busy = false;
    _setupIsCalled = false;
    _inFlightRefresh = null;
    _localAuthenticationInProgress = false;
    _crossTabAuthSyncPending = false;

    constructor() {
        super(...arguments);
        this.store = SESSION_CONFIG.store === 'ephemeral' ? new EphemeralStore() : new LocalStorageStore();
        this.store.onDataUpdated = (content) => this._onStoreDataUpdated(content);
    }

    willDestroy() {
        this.store.destroy();
        super.willDestroy(...arguments);
    }

    /**
     * Restores the persisted session and turns on the handlers that route the
     * user after sign-in and reload the app after sign-out.
     *
     * @method setup
     * @return {Promise<void>}
     * @public
     */
    async setup() {
        this._setupIsCalled = true;
        try {
            await this._restore();
        } catch (e) {
            // nothing restorable: the session stays unauthenticated
        }
    }

    /**
     * Authenticates with the named authenticator (e.g. `authenticator:oauth2`);
     * the remaining arguments go to the authenticator. Rejects with the
     * authenticator's error.
     *
     * @method authenticate
     * @param {String} authenticatorName
     * @return {Promise<void>}
     * @public
     */
    async authenticate(authenticatorName, ...args) {
        assert('Session#authenticate requires an authenticator', authenticatorName);
        this._localAuthenticationInProgress = true;
        logAuthEvent('sign-in started');

        try {
            const authenticator = this._lookupAuthenticator(authenticatorName);
            let content;

            this._busy = true;
            try {
                content = await authenticator.authenticate(...args);
            } catch (error) {
                this._busy = false;
                await this._clear();
                throw error;
            }

            this._busy = false;
            await this._setup(authenticatorName, content, true);
        } finally {
            this._localAuthenticationInProgress = false;
        }
    }

    /**
     * Invalidates the session; the app then reloads at rootURL (outside tests).
     *
     * @method invalidate
     * @return {Promise<void>}
     * @public
     */
    async invalidate(...args) {
        this.attemptedTransition = null;

        if (!this.isAuthenticated) {
            return;
        }

        this._busy = true;
        try {
            await this._lookupAuthenticator(this.authenticator).invalidate(this.data.authenticated, ...args);
        } finally {
            this._busy = false;
        }

        await this._clear(true);
    }

    /**
     * When unauthenticated, remembers the transition (retried after sign-in)
     * and sends the user to the given route, or calls the callback.
     *
     * @method requireAuthentication
     * @param {Transition} transition
     * @param {String|Function} routeOrCallback
     * @return {Boolean} Whether the session is authenticated
     * @public
     */
    requireAuthentication(transition, routeOrCallback) {
        const isAuthenticated = this.isAuthenticated;

        if (!isAuthenticated) {
            if (transition) {
                this.attemptedTransition = transition;
            }
            this._routeOrCall(routeOrCallback);
        }

        return isAuthenticated;
    }

    /**
     * When authenticated, sends the user to the given route, or calls the callback.
     *
     * @method prohibitAuthentication
     * @param {String|Function} routeOrCallback
     * @return {Boolean} Whether the session is unauthenticated
     * @public
     */
    prohibitAuthentication(routeOrCallback) {
        const isAuthenticated = this.isAuthenticated;

        if (isAuthenticated) {
            this._routeOrCall(routeOrCallback);
        }

        return !isAuthenticated;
    }

    /**
     * Routes the user after sign-in. Cross-tab session sync uses the same
     * destination rules as the sign-in form (default {@link DEFAULT_POST_AUTH_ROUTE}).
     * A transition intercepted by `requireAuthentication` is retried instead.
     *
     * @method handleAuthentication
     * @param {String} [routeAfterAuthentication]
     * @public
     */
    handleAuthentication(routeAfterAuthentication) {
        const fallbackRoute =
            routeAfterAuthentication ||
            SESSION_CONFIG.routeAfterAuthentication ||
            DEFAULT_POST_AUTH_ROUTE;
        const oldRequestedUrl = this.oldRequestedUrl;
        const destination = resolvePostAuthDestination({
            fallbackRoute,
            oldRequestedUrl,
        });

        if (oldRequestedUrl) {
            delete this.oldRequestedUrl;
        }

        logAuthEvent('post-auth navigation', { destination: String(destination).split('?')[0] });

        if (!this._localAuthenticationInProgress) {
            Logger.debug(
                'Prometheus.Services.Session: applying post-auth navigation after cross-tab session sync',
                { destination }
            );
        }

        const attemptedTransition = this.attemptedTransition;

        if (attemptedTransition) {
            this.attemptedTransition = null;
            attemptedTransition.retry();
        } else {
            this.router.transitionTo(destination);
        }
    }

    /**
     * Reloads the app at the given URL after sign-out, so in-memory data (the
     * store, services) is dropped. Skipped in tests.
     *
     * @method handleInvalidation
     * @param {String} routeAfterInvalidation
     * @public
     */
    handleInvalidation(routeAfterInvalidation) {
        if (!IS_TEST) {
            window.location.replace(routeAfterInvalidation);
        }
    }

    /**
     * Ensures the access token is fresh enough for API calls. Refreshes when
     * within {@link REFRESH_WINDOW_MS} of expiry or when `force` is true.
     *
     * Concurrent callers in the same tab share one in-flight refresh Promise.
     * Across tabs, at most one refresh POST runs; others wait, re-read persisted
     * session, and skip refresh when tokens are already updated.
     *
     * @method ensureFreshToken
     * @param {Object} [options]
     * @param {Boolean} [options.force=false] Refresh even if outside the window
     * @return {Promise<void>}
     * @public
     */
    ensureFreshToken(options = {}) {
        const force = options.force === true;

        if (!this.isAuthenticated) {
            return Promise.resolve();
        }

        if (!force && !this._tokenNeedsRefresh()) {
            logAuthEvent('refresh skipped', { reason: 'already fresh' });
            return Promise.resolve();
        }

        if (this._inFlightRefresh) {
            return this._inFlightRefresh;
        }

        this._inFlightRefresh = this._performCoordinatedRefresh(force).finally(() => {
            this._inFlightRefresh = null;
        });

        return this._inFlightRefresh;
    }

    /**
     * Removes the persisted session (active store) and the cross-tab refresh lock
     * from localStorage (used by the public auth status page to recover a stuck
     * session). The caller reloads the app afterwards.
     *
     * @method clearStoredSession
     * @public
     */
    async clearStoredSession() {
        try {
            await this.store?.clear();
        } catch (e) {
            // store unavailable
        }

        [SESSION_STORAGE_KEY, LS_LOCK_KEY].forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                // storage unavailable
            }
        });
    }

    // --- session lifecycle ---

    _routeOrCall(routeOrCallback) {
        if (typeof routeOrCallback === 'function') {
            routeOrCallback();
        } else {
            this.router.transitionTo(routeOrCallback);
        }
    }

    async _restore() {
        this._busy = true;
        let restored;

        try {
            restored = (await this.store.restore()) || {};
        } catch (e) {
            this._busy = false;
            await this._clear();
            throw e;
        }

        const authenticatorName = restored.authenticated?.authenticator;

        if (!authenticatorName) {
            delete restored.authenticated;
            this._busy = false;
            await this._clearWithContent(restored);
            throw new Error('no session to restore');
        }

        delete restored.authenticated.authenticator;
        let content;

        try {
            content = await this._lookupAuthenticator(authenticatorName).restore(restored.authenticated);
        } catch (e) {
            this._busy = false;
            await this._clearWithContent(restored);
            throw e;
        }

        this.data = restored;
        this._busy = false;
        await this._setup(authenticatorName, content);
    }

    async _setup(authenticatorName, authenticatedContent, trigger = false) {
        trigger = trigger && !this.isAuthenticated;
        this.isAuthenticated = true;
        this.authenticator = authenticatorName;
        this.data = { ...this.data, authenticated: authenticatedContent };

        try {
            await this._persist();
        } catch (e) {
            this.isAuthenticated = false;
            this.authenticator = null;
            this.data = { ...this.data, authenticated: {} };
            return;
        }

        if (trigger) {
            this._onAuthenticationSucceeded();
        }
    }

    async _clear(trigger = false) {
        trigger = trigger && this.isAuthenticated;
        this.isAuthenticated = false;
        this.authenticator = null;
        this.data = { ...this.data, authenticated: {} };

        await this._persist();

        if (trigger) {
            this._onInvalidationSucceeded();
        }
    }

    _clearWithContent(content, trigger = false) {
        this.data = { ...content };
        return this._clear(trigger);
    }

    /** Writes `data` with the authenticator name inside `authenticated`, as ESA did. */
    _persist() {
        if (this.authenticator) {
            this.data = {
                ...this.data,
                authenticated: { authenticator: this.authenticator, ...(this.data.authenticated || {}) },
            };
        }

        return this.store.persist(this.data);
    }

    /** Another tab changed the persisted session. */
    _onStoreDataUpdated(content) {
        logAuthEvent('cross-tab session update received');
        this._crossTabAuthSyncPending = !this._localAuthenticationInProgress;

        if (this._busy) {
            return;
        }

        const authenticatorName = content.authenticated?.authenticator;

        if (!authenticatorName) {
            this._clearWithContent(content, true).catch((e) => {
                Logger.error('Prometheus.Services.Session: cross-tab sign-out sync failed', e);
            });
            return;
        }

        this._busy = true;
        delete content.authenticated.authenticator;
        this._lookupAuthenticator(authenticatorName)
            .restore(content.authenticated)
            .then(
                (authenticatedContent) => {
                    this._busy = false;
                    if (this.isDestroying || this.isDestroyed) {
                        return;
                    }
                    this.data = content;
                    return this._setup(authenticatorName, authenticatedContent, true);
                },
                () => {
                    this._busy = false;
                    if (this.isDestroying || this.isDestroyed) {
                        return;
                    }
                    return this._clearWithContent(content, true);
                }
            )
            .catch((e) => {
                Logger.error('Prometheus.Services.Session: cross-tab session sync failed', e);
            });
    }

    _onAuthenticationSucceeded() {
        logAuthEvent('sign-in succeeded');
        this._crossTabAuthSyncPending = false;

        if (this._setupIsCalled) {
            this.handleAuthentication(SESSION_CONFIG.routeAfterAuthentication);
        }
    }

    _onInvalidationSucceeded() {
        logAuthEvent('invalidated', { crossTab: !!this._crossTabAuthSyncPending });

        if (this._crossTabAuthSyncPending && !this.isAuthenticated) {
            Logger.warn(
                'Prometheus.Services.Session: cross-tab auth sync failed; session could not be restored'
            );
        }

        this._crossTabAuthSyncPending = false;

        if (this._setupIsCalled) {
            this.handleInvalidation(ENV.rootURL);
        }
    }

    _lookupAuthenticator(name) {
        const authenticator = getOwner(this).lookup(name);
        assert(`No authenticator "${name}" could be found`, authenticator);
        return authenticator;
    }

    // --- token refresh ---

    _tokenNeedsRefresh() {
        const expiresAt = this.data.authenticated?.expires_at;
        const refreshToken = this.data.authenticated?.refresh_token;

        if (!refreshToken || !expiresAt) {
            return false;
        }

        return expiresAt - Date.now() < REFRESH_WINDOW_MS;
    }

    async _performCoordinatedRefresh(force) {
        logAuthEvent('refresh started', { force });

        return this._withCrossTabLock(async () => {
            logAuthEvent('cross-tab lock acquired');
            await this._reconcileSessionFromStore();

            if (!force && !this._tokenNeedsRefresh()) {
                logAuthEvent('refresh skipped', { reason: 'refreshed by another tab' });
                return;
            }

            await this._postRefreshTokenGrant();
        });
    }

    async _reconcileSessionFromStore() {
        const restored = await this.store.restore();
        const restoredAuth = restored?.authenticated;

        if (!restoredAuth?.access_token || !restoredAuth?.expires_at) {
            return;
        }

        const currentExpiresAt = this.data.authenticated?.expires_at || 0;

        if (
            restoredAuth.expires_at > currentExpiresAt ||
            restoredAuth.access_token !== this.data.authenticated?.access_token
        ) {
            run(() => {
                this._applyAuthenticatedData(restoredAuth);
            });
        }
    }

    _applyAuthenticatedData(auth) {
        const authenticated = { ...(this.data.authenticated || {}) };

        Object.keys(auth).forEach((key) => {
            if (key !== 'authenticator') {
                authenticated[key] = auth[key];
            }
        });

        this.data = { ...this.data, authenticated };
    }

    async _postRefreshTokenGrant() {
        const refreshToken = this.data.authenticated?.refresh_token;

        if (!refreshToken) {
            return;
        }

        const url = `${ENV.api.host}/api/v${ENV.api.version}/token`;
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: ENV.api.clientId,
            client_secret: ENV.api.clientSecret,
        });

        try {
            const fetchResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });

            if (!fetchResponse.ok) {
                logAuthEvent('refresh failed', { status: fetchResponse.status });
                throw new Error(`Token refresh failed: ${fetchResponse.statusText}`);
            }

            const response = await fetchResponse.json();
            const now = Date.now();
            const expiresAt = new Date(now + response.expires_in * 1000).getTime();
            const authenticated = Object.assign(
                { authenticator: 'authenticator:oauth2' },
                this.data.authenticated || {},
                {
                    access_token: response.access_token,
                    expires_at: expiresAt,
                    refresh_token: response.refresh_token,
                    scope: response.scope,
                    token_type: response.token_type,
                }
            );

            logAuthEvent('refresh succeeded');
            run(() => {
                this._applyAuthenticatedData(authenticated);
                this.store.persist(Object.assign({}, this.data || {}, { authenticated }));
            });
        } catch (err) {
            logAuthEvent('refresh failed', { error: err.message });
            run(() => {
                this.invalidate();
            });
            throw err;
        }
    }

    _withCrossTabLock(callback) {
        if (typeof navigator !== 'undefined' && navigator.locks?.request) {
            return navigator.locks.request(CROSS_TAB_LOCK_NAME, callback);
        }

        return this._withLocalStorageLock(callback);
    }

    async _withLocalStorageLock(callback) {
        if (typeof localStorage === 'undefined') {
            return callback();
        }

        const deadline = Date.now() + LS_LOCK_TTL_MS;

        while (Date.now() < deadline) {
            const now = Date.now();
            const existing = localStorage.getItem(LS_LOCK_KEY);
            const existingTs = existing ? parseInt(existing, 10) : NaN;

            if (!existing || Number.isNaN(existingTs) || now - existingTs > LS_LOCK_TTL_MS) {
                localStorage.setItem(LS_LOCK_KEY, String(now));

                try {
                    return await callback();
                } finally {
                    localStorage.removeItem(LS_LOCK_KEY);
                }
            }

            await new Promise((resolve) => {
                setTimeout(resolve, LS_LOCK_POLL_MS);
            });
        }

        throw new Error('OAuth token refresh lock timeout');
    }
}
