/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { readAuthLog, clearAuthLog } from 'prometheus/utils/auth/auth-log';

/**
 * ISO time, or an empty string when the value is not a valid date.
 *
 * @param {number|string} t
 * @return {string}
 */
const fmtTime = (t) => {
    const d = new Date(t);

    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
};

/**
 * Public auth diagnostics page. Reads only the session service's public API
 * (`isAuthenticated`, `data`) and the auth-log module.
 *
 * @class AuthStatusController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 */
export default class AuthStatusController extends Controller {
    /**
     * @property session
     * @type Ember.Service
     */
    @service session;

    /**
     * Bumped to re-read the log.
     *
     * @property tick
     * @type Number
     */
    @tracked tick = 0;

    /**
     * @property copied
     * @type Boolean
     */
    @tracked copied = false;

    /**
     * Log entries, newest first, with a formatted time.
     *
     * @property entries
     * @type Array
     */
    get entries() {
        void this.tick;

        return readAuthLog()
            .slice()
            .reverse()
            .map((e) => ({
                time: fmtTime(e.time),
                tab: e.tab,
                event: e.event,
                detail: Object.keys(e.detail || {}).length ? JSON.stringify(e.detail) : '',
            }));
    }

    /**
     * Redacted, display-ready view of the session.
     *
     * @property sessionInfo
     * @type Object
     */
    get sessionInfo() {
        void this.tick;
        const auth = this.session.data?.authenticated || {};
        const expiresAt = auth.expires_at;
        const seconds = expiresAt && !Number.isNaN(Number(expiresAt)) ? Math.round((expiresAt - Date.now()) / 1000) : null;

        return {
            authenticated: !!this.session.isAuthenticated,
            authenticator: auth.authenticator || '',
            accessToken: auth.access_token ? `…${String(auth.access_token).slice(-4)}` : '',
            hasRefreshToken: !!auth.refresh_token,
            expiresAt: fmtTime(expiresAt),
            expiresIn: seconds === null ? '' : `${seconds}s`,
            tokenType: auth.token_type || '',
            scope: auth.scope || '',
        };
    }

    /**
     * Last refresh outcome and last cross-tab event from the log.
     *
     * @property summary
     * @type Object
     */
    get summary() {
        const log = readAuthLog();
        const last = (pred) => log.slice().reverse().find(pred);
        const refresh = last((e) => /^refresh (succeeded|failed)$/.test(e.event));
        const cross = last((e) => /cross-tab/.test(e.event));
        const text = (e) =>
            e ? `${e.event} ${Object.keys(e.detail || {}).length ? JSON.stringify(e.detail) : ''} (${fmtTime(e.time)})` : '';

        return { refresh: text(refresh), crossTab: text(cross) };
    }

    /**
     * Re-reads session and log.
     *
     * @method refresh
     */
    @action
    refresh() {
        this.tick++;
    }

    /**
     * Copies the log as text for bug reports.
     *
     * @method copyLog
     */
    @action
    async copyLog() {
        this.copied = false;
        const text = readAuthLog()
            .map((e) => `${fmtTime(e.time)} [${e.tab}] ${e.event} ${JSON.stringify(e.detail || {})}`)
            .join('\n');

        try {
            await navigator.clipboard.writeText(text);
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.copied = true;
        } catch (e) {
            // clipboard unavailable
        }
    }

    /**
     * Removes the session storage and refresh lock keys, then reloads at /signin.
     *
     * @method clearSession
     */
    @action
    async clearSession() {
        await this.session.clearStoredSession();
        this._goToSignin();
    }

    /**
     * Full reload at the sign-in page (overridable in tests).
     *
     * @method _goToSignin
     * @private
     */
    _goToSignin() {
        window.location.assign('/signin');
    }

    /**
     * Empties the event log.
     *
     * @method clearLog
     */
    @action
    clearLog() {
        clearAuthLog();
        this.tick++;
    }
}
