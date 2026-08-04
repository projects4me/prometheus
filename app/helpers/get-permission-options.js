/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * Returns binary permission options (Allow / None, plus Not set only while unset)
 * from flat apiOptions.
 *
 * Pass the current allowed value as the 2nd arg so the list recomputes when it changes.
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
     * @param {string} type aclSettings key (e.g. apiOptions)
     * @param {*} [currentValue] current permission.allowed (or similar); hides Not set when set
     * @returns {Object[]}
     */
    compute([type, currentValue]) {
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

        let isUnset = currentValue === null
            || currentValue === undefined
            || currentValue === '';

        let optionsList = [];

        // Only offer "Not set" while the permission has no applied value.
        if (isUnset) {
            optionsList.push({
                label: this.intl.t("views.app.role.tabs.permission.options.notset"),
                value: ""
            });
        }

        for (let [key, value] of Object.entries(options)) {
            optionsList.push({
                label: this.intl.t(`views.app.role.tabs.permission.options.${key}`),
                value: value
            });
        }

        return optionsList;
    }
});
