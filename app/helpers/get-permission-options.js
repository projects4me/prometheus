/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * Returns binary permission options (None / Allow) for model or field resources.
 *
 * @class GetPermissionOptions
 * @extends Ember.Component.Helper
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default Helper.extend({

    /**
     * @property settings
     * @type Ember.Service
     * @private
     */
    settings: service(),

    /**
     * @property intl
     * @type Ember.Service
     * @private
     */
    intl: service(),

    /**
     * @param {string} type
     * @param {Prometheus.Models.Permission} permission
     * @param {string} flag
     * @returns {Object[]}
     */
    compute([type, permission /*, flag */]) {
        let aclSettings = this.settings.get('aclSettings') || {};
            let apiOptions = aclSettings[type] || {};
            let resourceType = 'field';
            // Model-level row uses model options; field/rel rows use field options.
            if (permission && permission.moduleName === permission.resourceName) {
            resourceType = 'model';
            }
            let options = Object.assign(
            {},
            apiOptions[resourceType] || apiOptions.field || apiOptions.model || {
            allow: '1',
            none: '0'
            }
            );

        let optionsList = [{
            label: this.intl.t("views.app.role.tabs.permission.options.notset"),
            value: ""
        }];

        for (let [key, value] of Object.entries(options)) {
            optionsList.push({
                label: this.intl.t(`views.app.role.tabs.permission.options.${key}`),
                value: value
            });
        }

        return optionsList;
    }
});