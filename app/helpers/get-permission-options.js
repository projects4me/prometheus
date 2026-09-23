/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * Returns permission select options for a module-action resource.
 *
 * Uses `scopedApiOptions` (all/members/none → 1/2/0) for resources listed in
 * `aclSettings.scopedResources` (e.g. project.get); otherwise `apiOptions`
 * (allow/none → 1/0).
 *
 * Pass the resource name and current allowed value so the list recomputes.
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
     * @param {string} resourceOrType resourceName (e.g. project.get) or legacy options key
     * @param {*} [currentValue] current permission.allowed; hides Not set when set
     * @returns {Object[]}
     */
    compute([resourceOrType, currentValue]) {
        let aclSettings = this.settings.get('aclSettings') || {};
        let optionsKey = this.resolveOptionsKey(resourceOrType, aclSettings);
        let apiOptions = aclSettings[optionsKey] || {};

        let options = Object.assign(
            {},
            (Object.keys(apiOptions).length > 0)
                ? apiOptions
                : this.defaultOptions(optionsKey)
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
    },

    /**
     * @param {string} resourceOrType
     * @param {Object} aclSettings
     * @returns {string}
     * @private
     */
    resolveOptionsKey(resourceOrType, aclSettings) {
        if (resourceOrType === 'apiOptions' || resourceOrType === 'scopedApiOptions') {
            return resourceOrType;
        }

        let scopedResources = aclSettings.scopedResources || [];
        if (typeof scopedResources === 'string') {
            try {
                scopedResources = JSON.parse(scopedResources);
            } catch (e) {
                scopedResources = [];
            }
        }
        if (!Array.isArray(scopedResources)) {
            scopedResources = [];
        }

        if (scopedResources.includes(resourceOrType)) {
            return 'scopedApiOptions';
        }

        return 'apiOptions';
    },

    /**
     * @param {string} optionsKey
     * @returns {Object}
     * @private
     */
    defaultOptions(optionsKey) {
        if (optionsKey === 'scopedApiOptions') {
            return {
                all: '1',
                members: '2',
                none: '0'
            };
        }
        return {
            allow: '1',
            none: '0'
        };
    }
});
