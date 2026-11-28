/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';

/**
 * The localStorage key that keeps the desktop collapsed preference across sessions.
 *
 * @property SIDEBAR_STORAGE_KEY
 * @type String
 * @final
 */
export const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

/**
 * Keeps the desktop sidebar's collapsed preference in browser storage. Storage that can't be read means expanded;
 * storage that can't be written (private mode, full storage) just doesn't keep the preference.
 *
 * @class SidebarPreferenceService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class SidebarPreferenceService extends Service {

    /**
     * The storage to use; localStorage when not set. Reading window.localStorage itself can throw, so it is read
     * lazily.
     *
     * @property storage
     * @type Storage
     * @for SidebarPreferenceService
     * @public
     */
    storage = null;

    /**
     * Whether the sidebar was left collapsed.
     *
     * @method read
     * @return {Boolean}
     * @public
     */
    read() {
        try {
            return this._storage().getItem(SIDEBAR_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Keeps whether the sidebar is collapsed.
     *
     * @method write
     * @param {Boolean} collapsed
     * @public
     */
    write(collapsed) {
        try {
            this._storage().setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
        } catch {
            // The preference just isn't kept.
        }
    }

    /**
     * The storage to use.
     *
     * @method _storage
     * @return {Storage}
     * @private
     */
    _storage() {
        return this.storage ?? window.localStorage;
    }
}
