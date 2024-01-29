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
     * @private
     */
    settings: service(),

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for Prometheus.Helpers.GetPermissionOptions
     * @private
     */
    intl: service(),

    /**
     * This method returns the permission options of the requested module of the system.
     * 
     * @param {string} type The name of the module e.g. API, frontend.
     * @returns {Object} List of options
     */
    compute([type, ...rest], hash) {
        let options = this.settings.get('aclSettings')[type];
        let optionsList = [{
            label: this.intl.t("views.app.role.permission.options.notset"),
            value: ""
        }];

        //format list of options
        for (let [key, value] of Object.entries(options)) {
            optionsList.push({
                label: this.intl.t(`views.app.role.permission.options.${key}`),
                value: value
            })
        }
        return optionsList;
    }
});