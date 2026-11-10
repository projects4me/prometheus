/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Keeps the session in memory only. Used by the test suite (`ENV.session.store`
 * is `ephemeral` there), so tests never share a session through localStorage.
 * Data is stored as JSON so callers never share an object with the store.
 *
 * @class EphemeralStore
 * @namespace Prometheus.SessionStores
 * @public
 */
export default class EphemeralStore {
    /**
     * Never called: there are no other tabs. Kept for the store interface.
     *
     * @property onDataUpdated
     * @type Function
     * @public
     */
    onDataUpdated = null;

    _data = '{}';

    /**
     * @method persist
     * @param {Object} data
     * @return {Promise<void>}
     * @public
     */
    persist(data) {
        this._data = JSON.stringify(data || {});
        return Promise.resolve();
    }

    /**
     * @method restore
     * @return {Promise<Object>}
     * @public
     */
    restore() {
        return Promise.resolve(JSON.parse(this._data) || {});
    }

    /**
     * @method clear
     * @return {Promise<void>}
     * @public
     */
    clear() {
        this._data = '{}';
        return Promise.resolve();
    }

    /**
     * @method destroy
     * @public
     */
    destroy() {}
}
