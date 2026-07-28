/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * Returns binary permission options (Not set / Allow / None) from flat apiOptions.
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
     * @returns {Object[]}
     */
    compute([type /*, permission, flag */]) {
        let aclSettings = this.settings.get('aclSettings') || {};
        let apiOptions = aclSettings[type] || {};
        let options = Object.assign(
            {},
            (apiOptions.allow !== undefined || apiOptions.none !== undefined)
                ? apiOptions
                : {
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
