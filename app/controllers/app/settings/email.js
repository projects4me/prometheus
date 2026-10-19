/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The form fields of the Email page and the setting that stores each of them.
 */
const SETTING_KEYS = {
    host: 'email.smtpHost',
    port: 'email.smtpPort',
    encryption: 'email.smtpEncryption',
    username: 'email.smtpUsername',
    password: 'email.smtpPassword',
    fromName: 'email.fromName',
    fromEmail: 'email.fromEmail'
};

/**
 * Port numbers 1 to 65535.
 */
const PORT_PATTERN = /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;

/**
 * The controller of the Email page of the Settings area. Edits the outgoing
 * mail (SMTP) settings through a draft, so unsaved changes can be told apart
 * from the saved values and discarded.
 *
 * @class AppSettingsEmailController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends PrometheusCreateController
 */
export default class AppSettingsEmailController extends PrometheusCreateController {

    /**
     * The values being edited. The password is write-only, so it stays empty
     * unless the user types a new one.
     *
     * @property draft
     * @type Object
     * @public
     */
    @tracked draft = {};

    /**
     * Whether a password is already stored on the server.
     *
     * @property passwordIsSet
     * @type Boolean
     * @public
     */
    @tracked passwordIsSet = false;

    /**
     * Whether a save is in progress.
     *
     * @property saving
     * @type Boolean
     * @public
     */
    @tracked saving = false;

    /**
     * The encryption choices of the power-select.
     *
     * @property encryptions
     * @type Array
     * @public
     */
    encryptions = [
        { value: 'tls', label: 'views.app.settings.email.encryption.tls' },
        { value: 'ssl', label: 'views.app.settings.email.encryption.ssl' },
        { value: 'none', label: 'views.app.settings.email.encryption.none' }
    ];

    /**
     * The setting records of the email group, by form field.
     *
     * @property records
     * @type Object
     * @private
     */
    records = {};

    /**
     * Validation schema definition of the SMTP form. The server falls back to
     * its own configuration for blank values, so only the connection details
     * are required.
     *
     * @property metadata
     * @type Object
     * @protected
     */
    metadata = {
        sections: [
            {
                name: 'emailForm',
                fields: [
                    {
                        name: 'host',
                        validations: {
                            default: { type: 'string', rules: [{ name: 'required' }] }
                        }
                    },
                    {
                        name: 'port',
                        validations: {
                            default: {
                                type: 'string',
                                rules: [
                                    { name: 'required' },
                                    { name: 'matches', value: [PORT_PATTERN, this.intl.t('views.app.settings.email.portInvalid')] }
                                ]
                            }
                        }
                    },
                    {
                        name: 'fromEmail',
                        validations: {
                            default: { type: 'string', rules: [{ name: 'email' }] }
                        }
                    }
                ]
            }
        ]
    };

    /**
     * Builds the validation schema from the metadata.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * The choice of the encryption power-select that matches the draft.
     *
     * @property selectedEncryption
     * @type Object
     * @public
     */
    get selectedEncryption() {
        return this.encryptions.find((encryption) => encryption.value === this.draft.encryption);
    }

    /**
     * True when the draft differs from the saved settings; blocks navigation.
     *
     * @method isDirty
     * @return {boolean}
     * @public
     */
    get isDirty() {
        return Object.keys(this._changes()).length > 0;
    }

    /**
     * Builds the draft from the loaded settings and clears any messages.
     *
     * @method loadSettings
     * @param {Array} settings
     * @public
     */
    loadSettings(settings) {
        let records = {};
        let draft = {};

        Object.entries(SETTING_KEYS).forEach(([field, key]) => {
            let record = settings.find((setting) => setting.name === key);
            records[field] = record;
            draft[field] = (field === 'password' || !record) ? '' : (record.settingValue ?? '');
        });

        this.records = records;
        this.draft = draft;
        this.passwordIsSet = Boolean(records.password && records.password.isSet);
        this.message = {};
    }

    /**
     * Sets the encryption chosen in the power-select.
     *
     * @method setEncryption
     * @param {Object} encryption
     * @protected
     */
    @action setEncryption(encryption) {
        this.draft = { ...this.draft, encryption: encryption.value };
    }

    /**
     * Validates the draft and saves the settings that changed.
     *
     * @method saveEmail
     * @protected
     */
    @action saveEmail() {
        this.validate(this.draft, 'emailForm').then((validation) => {
            if (!validation.isValid) {
                this._showError(validation.errors, 'settings.email');
                return;
            }

            let changes = this._changes();
            this.saving = true;

            let saves = Object.entries(changes).map(([field, value]) => {
                let record = this.records[field];
                record.settingValue = value;
                return record.save();
            });

            Promise.all(saves).then(() => {
                this.loadSettings(Object.values(this.records).filter(Boolean));
                new Messenger().post({
                    message: this.intl.t('views.app.settings.email.saved'),
                    type: 'success',
                    showCloseButton: true
                });
            }).catch(() => {
                Object.keys(changes).forEach((field) => this.records[field].rollbackAttributes());
                new Messenger().post({
                    message: this.intl.t('views.app.settings.email.saveFailed'),
                    type: 'error',
                    showCloseButton: true
                });
            }).finally(() => {
                this.saving = false;
            });
        });

        return false;
    }

    /**
     * Discards the unsaved changes.
     *
     * @method cancelEmail
     * @protected
     */
    @action cancelEmail() {
        this.loadSettings(Object.values(this.records).filter(Boolean));
    }

    /**
     * The draft values that differ from the saved ones. A blank password
     * keeps the stored one.
     *
     * @method _changes
     * @return {Object} New value by form field
     * @private
     */
    _changes() {
        let changes = {};

        Object.keys(SETTING_KEYS).forEach((field) => {
            let record = this.records[field];
            let value = this.draft[field] ?? '';

            if (!record) {
                return;
            }
            if (field === 'password' ? value !== '' : value !== (record.settingValue ?? '')) {
                changes[field] = value;
            }
        });

        return changes;
    }
}
