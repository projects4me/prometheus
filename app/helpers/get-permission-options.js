/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * This template helper class is used to return different permission options.
 *
 * @class GetPermissionOptions
 * @extends Ember.Component.Helper
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default Helper.extend({

    /**
     * The settings service maintains all of the system level configurations.
     * 
     * @property settings
     * @type Ember.Service
     * @for Prometheus.Helpers.GetPermissionOptions
     * @public
     */
    settings: service(),

    /**
     * This method returns the permission options of the requested module of the system.
     * 
     * @param {string} type The name of the module e.g. API, frontend.
     * @returns {Object} List of options
     */
    compute([type, ...rest], hash) {
        let options = this.settings.get('aclSettings')[type];
        let optionsList = [];

        //format list of options
        for (let [key, value] of Object.entries(options)) {
            optionsList.push({
                label: key,
                value: value
            })
        }
        return optionsList;
    }
});