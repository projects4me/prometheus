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
    compute([type, permission, ...rest], hash) {
        let resourceType = 'field',
            modelDependentGroups = [];

        // Default options.
        let options = {};
        options = (this.settings.get('aclSettings')[type][resourceType]);
        let optionsList = [{
            label: this.intl.t("views.app.role.permission.options.notset"),
            value: ""
        }];

        // Set options if the resource is model.
        if (permission.moduleName === permission.resourceName) {
            resourceType = 'model';
            modelDependentGroups = this.settings.get('aclSettings')['modelGroups'][permission.resourceName];
            options = _.clone(this.settings.get('aclSettings')[type][resourceType]);

            modelDependentGroups.forEach((group) => {
                let apiOptions = this.settings.get('aclSettings')['apiOptions'];
                group = group.toLowerCase();
                options[group] = apiOptions['groups'][group];
            });
        }

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