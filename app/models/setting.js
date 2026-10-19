/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A single application setting (one row per key, e.g. `email.smtpHost`).
 *
 * Secure settings (such as the SMTP password) never come back from the API:
 * `settingValue` is null and `isSet` tells whether a value is stored.
 *
 * @class SettingModel
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class SettingModel extends Model {

    /**
     * The unique dotted key of the setting.
     *
     * @property name
     * @type String
     * @for SettingModel
     * @public
     */
    @attr('string') name;

    /**
     * The section of the Settings area the setting belongs to.
     *
     * @property groupName
     * @type String
     * @for SettingModel
     * @public
     */
    @attr('string') groupName;

    /**
     * The value of the setting, always null for secure settings.
     *
     * @property settingValue
     * @type String
     * @for SettingModel
     * @public
     */
    @attr('string') settingValue;

    /**
     * Whether the value is secret and write-only.
     *
     * @property secure
     * @type Boolean
     * @for SettingModel
     * @public
     */
    @attr('boolean') secure;

    /**
     * Whether a secure setting has a stored value.
     *
     * @property isSet
     * @type Boolean
     * @for SettingModel
     * @public
     */
    @attr('boolean') isSet;
}
