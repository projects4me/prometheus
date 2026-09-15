/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ESASession from 'ember-simple-auth/services/session';
import Configuration from 'ember-simple-auth/configuration';
import ENV from 'prometheus/config/environment';
import { run } from '@ember/runloop';
import Logger from 'js-logger';
import {
    DEFAULT_POST_AUTH_ROUTE,
    resolvePostAuthDestination,
} from 'prometheus/utils/auth/post-auth-destination';

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
const LS_LOCK_KEY = 'prometheus_oauth_token_refresh_lock';
const LS_LOCK_TTL_MS = 30 * 1000;
const LS_LOCK_POLL_MS = 50;

/**
 * Extended ember-simple-auth session: coordinates OAuth refresh_token grants
 * (in-tab single-flight and cross-tab locking). Password login stays on
 * `authenticator:oauth2`; this service owns refresh only.
 *
 * @class SessionService
 * @namespace Prometheus.Services
 * @extends ESASession
 * @public
 */
export default ESASession.extend({
    _inFlightRefresh: null,
    _localAuthenticationInProgress: false,

    init() {
        this._super(...arguments);
        this._subscribeCrossTabAuthSyncDiagnostics();
    },

    authenticate() {
        this._localAuthenticationInProgress = true;

        return this._super(...arguments).finally(() => {
            this._localAuthenticationInProgress = false;
        });
    },

    /**
     * Routes the user after sign-in. Cross-tab session sync uses the same
     * destination rules as the sign-in form (default {@link DEFAULT_POST_AUTH_ROUTE}).
     *
     * @method handleAuthentication
     * @param {String} [routeAfterAuthentication]
     * @public
     */
    handleAuthentication(routeAfterAuthentication) {
        const fallbackRoute =
            routeAfterAuthentication ||
            Configuration.routeAfterAuthentication ||
            DEFAULT_POST_AUTH_ROUTE;
        const oldRequestedUrl = this.oldRequestedUrl;
        const destination = resolvePostAuthDestination({
            fallbackRoute,
            oldRequestedUrl,
        });

        if (oldRequestedUrl) {
            delete this.oldRequestedUrl;
        }

        if (!this._localAuthenticationInProgress) {
            Logger.debug(
                'Prometheus.Services.Session: applying post-auth navigation after cross-tab session sync',
                { destination }
            );
        }

        return this._super(destination);
    },

    _subscribeCrossTabAuthSyncDiagnostics() {
        const internalSession = this.get('session');
        const store = internalSession?.store;

        if (!store || typeof store.on !== 'function') {
            return;
        }

        store.on('sessionDataUpdated', () => {
            this._crossTabAuthSyncPending = !this._localAuthenticationInProgress;
        });

        internalSession.on('invalidationSucceeded', () => {
            if (this._crossTabAuthSyncPending && !this.get('isAuthenticated')) {
                Logger.warn(
                    'Prometheus.Services.Session: cross-tab auth sync failed; session could not be restored'
                );
            }

            this._crossTabAuthSyncPending = false;
        });

        internalSession.on('authenticationSucceeded', () => {
            if (this._crossTabAuthSyncPending) {
                this._crossTabAuthSyncPending = false;
            }
        });
    },

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

        if (!this.get('isAuthenticated')) {
            return Promise.resolve();
        }

        if (!force && !this._tokenNeedsRefresh()) {
            return Promise.resolve();
        }

        if (this._inFlightRefresh) {
            return this._inFlightRefresh;
        }

        this._inFlightRefresh = this._performCoordinatedRefresh(force).finally(() => {
            this._inFlightRefresh = null;
        });

        return this._inFlightRefresh;
    },

    _tokenNeedsRefresh() {
        const expiresAt = this.get('data.authenticated.expires_at');
        const refreshToken = this.get('data.authenticated.refresh_token');

        if (!refreshToken || !expiresAt) {
            return false;
        }

        return expiresAt - Date.now() < REFRESH_WINDOW_MS;
    },

    async _performCoordinatedRefresh(force) {
        return this._withCrossTabLock(async () => {
            await this._reconcileSessionFromStore();

            if (!force && !this._tokenNeedsRefresh()) {
                return;
            }

            await this._postRefreshTokenGrant();
        });
    },

    async _reconcileSessionFromStore() {
        const store = this.get('store');

        if (!store || typeof store.restore !== 'function') {
            return;
        }

        const restored = await store.restore();
        const restoredAuth = restored?.authenticated;

        if (!restoredAuth?.access_token || !restoredAuth?.expires_at) {
            return;
        }

        const currentExpiresAt = this.get('data.authenticated.expires_at') || 0;

        if (
            restoredAuth.expires_at > currentExpiresAt ||
            restoredAuth.access_token !== this.get('data.authenticated.access_token')
        ) {
            run(() => {
                this._applyAuthenticatedData(restoredAuth);
            });
        }
    },

    _applyAuthenticatedData(auth) {
        Object.keys(auth).forEach((key) => {
            if (key === 'authenticator') {
                return;
            }
            this.set(`data.authenticated.${key}`, auth[key]);
        });
    },

    async _postRefreshTokenGrant() {
        const refreshToken = this.get('data.authenticated.refresh_token');

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
                throw new Error(`Token refresh failed: ${fetchResponse.statusText}`);
            }

            const response = await fetchResponse.json();
            const now = Date.now();
            const expiresAt = new Date(now + response.expires_in * 1000).getTime();
            const authenticated = Object.assign(
                { authenticator: 'authenticator:oauth2' },
                this.get('data.authenticated') || {},
                {
                    access_token: response.access_token,
                    expires_at: expiresAt,
                    refresh_token: response.refresh_token,
                    scope: response.scope,
                    token_type: response.token_type,
                }
            );

            run(() => {
                this._applyAuthenticatedData(authenticated);
                this.get('store').persist(Object.assign({}, this.get('data') || {}, { authenticated }));
            });
        } catch (err) {
            run(() => {
                this.invalidate();
            });
            throw err;
        }
    },

    _withCrossTabLock(callback) {
        if (typeof navigator !== 'undefined' && navigator.locks?.request) {
            return navigator.locks.request(CROSS_TAB_LOCK_NAME, callback);
        }

        return this._withLocalStorageLock(callback);
    },

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
    },
});
