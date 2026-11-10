/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { run } from '@ember/runloop';

/**
 * The localStorage key of the persisted session. It is the key ember-simple-auth
 * used, so sessions persisted before the switch stay valid and a rollback to
 * ember-simple-auth needs no migration. Do not change it.
 *
 * @constant {String} SESSION_STORAGE_KEY
 */
export const SESSION_STORAGE_KEY = 'ember_simple_auth-session';

/**
 * Persists the session in localStorage and reports changes made by other tabs
 * (the `storage` event) through `onDataUpdated`. It only stores and reads the
 * data; the session service decides what the data means.
 *
 * @class LocalStorageStore
 * @namespace Prometheus.SessionStores
 * @public
 */
export default class LocalStorageStore {
    /**
     * The localStorage key the session is kept under.
     *
     * @property key
     * @type String
     * @public
     */
    key = SESSION_STORAGE_KEY;

    /**
     * Called with the new data when another tab changed the persisted session.
     *
     * @property onDataUpdated
     * @type Function
     * @public
     */
    onDataUpdated = null;

    /**
     * The data last written or seen, to ignore storage events that change nothing.
     *
     * @property _lastData
     * @type Object
     * @private
     */
    _lastData = null;

    constructor() {
        this._storageHandler = (event) => this._handleStorageEvent(event);
        window.addEventListener('storage', this._storageHandler);
    }

    /**
     * Writes the session data.
     *
     * @method persist
     * @param {Object} data
     * @return {Promise<void>}
     * @public
     */
    persist(data) {
        try {
            const json = JSON.stringify(data || {});
            localStorage.setItem(this.key, json);
            this._lastData = json;
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Reads the session data; an empty object when nothing (or nothing readable)
     * is stored.
     *
     * @method restore
     * @return {Promise<Object>}
     * @public
     */
    restore() {
        return Promise.resolve(this._read());
    }

    /**
     * Removes the session data.
     *
     * @method clear
     * @return {Promise<void>}
     * @public
     */
    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (e) {
            // storage unavailable
        }
        this._lastData = null;
        return Promise.resolve();
    }

    /**
     * Stops listening for changes from other tabs.
     *
     * @method destroy
     * @public
     */
    destroy() {
        window.removeEventListener('storage', this._storageHandler);
    }

    _read() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || {};
        } catch (e) {
            return {};
        }
    }

    _handleStorageEvent(event) {
        // A null key means another tab cleared all of localStorage.
        if (event.key !== this.key && event.key !== null) {
            return;
        }

        const data = this._read();
        const json = JSON.stringify(data);

        if (json !== this._lastData) {
            this._lastData = json;
            run(() => this.onDataUpdated?.(data));
        }
    }
}
