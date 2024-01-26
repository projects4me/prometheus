/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';

/**
 * The settings service is used to maintain all of the system level configurations.
 *
 * @class SettingsService
 * @namespace Prometheus.Services
 * @extends Ember.service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class SettingsService extends Service {

    /**
     * This is the store service which is used to interact with the data API.
     *
     * @property store
     * @type Ember.Service
     * @for SettingsService
     * @protected
     */
    @service store;

    /**
     * This property holds list of configurations.
     * 
     * @property _systemSettings
     * @for SettingsService
     * @public
     */
    _systemSettings = [];

    /**
     * This method call systemsetting endpoint to fetch settings list.
     * 
     * @method loadSettings
     * @public
     */
    loadSettings() {
        let _self = this;
        return this.store.findAll('systemsetting').then((settings) => {
            _self.set('_systemSettings', settings.objectAt(0));
        });
    }

    /**
     * This method is used to return the list of settings of the given type.
     * 
     * @param {String} type 
     * @returns Array
     */
    get(type) {
        return this._systemSettings[type];
    }
}
