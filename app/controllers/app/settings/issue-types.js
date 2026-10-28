/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { addIssueTypeLabels, issueTypeRecordLabel, ISSUE_TYPE_LABEL_PATH } from 'prometheus/utils/issue-status/label';
import { labelCaption, TYPE_LABEL_CAPTION_KEY } from 'prometheus/utils/issue-status/caption';
import IssueStatusForm from 'prometheus/utils/issue-status/form';

/**
 * The controller of the Issue Types page of the Settings area. Adds, edits and
 * deletes the default issue types.
 *
 * @class AppSettingsIssueTypesController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends PrometheusCreateController
 */
export default class AppSettingsIssueTypesController extends PrometheusCreateController {

    /**
     * The default issue types listed on the page.
     *
     * @property issueTypes
     * @type Array
     * @public
     */
    @tracked issueTypes = [];

    /**
     * The service that provides the locales of the labels.
     *
     * @property translations
     * @type Prometheus.Services.Translations
     * @public
     */
    @service translations;

    /**
     * The issue type being added or edited in the modal, null when it is closed.
     *
     * @property editing
     * @type Prometheus.Models.Issuetype
     * @public
     */
    @tracked editing = null;

    /**
     * The label form of the issue type in the modal.
     *
     * @property form
     * @type Prometheus.Utils.IssueStatusForm
     * @public
     */
    @tracked form = null;

    /**
     * Validation schema definition of the issue type form.
     *
     * @property metadata
     * @type Object
     * @protected
     */
    metadata = {
        sections: [
            {
                name: 'issueTypeForm',
                fields: [
                    {
                        name: 'defaultLabel',
                        validations: {
                            default: {
                                type: 'string',
                                rules: [{ name: 'required' }]
                            }
                        }
                    },
                    {
                        name: 'name',
                        validations: {
                            default: {
                                type: 'string',
                                rules: [{ name: 'required' }]
                            }
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
     * Opens the modal on a new default issue type.
     *
     * @method showAddDialog
     * @protected
     */
    @action showAddDialog() {
        this.message.issueTypeForm = {};
        this.form = new IssueStatusForm({
            locales: this.translations.locales,
            defaultLocale: this.translations.defaultLocale,
            captionFor: this.captionFor
        });
        this.editing = this.store.createRecord('issuetype', { system: '1' });
    }

    /**
     * Opens the modal to edit the given issue type.
     *
     * @method showEditDialog
     * @param {Prometheus.Models.Issuetype} issueType
     * @protected
     */
    @action showEditDialog(issueType) {
        this.message.issueTypeForm = {};
        this.form = new IssueStatusForm({
            locales: this.translations.locales,
            defaultLocale: this.translations.defaultLocale,
            translations: this.savedLabels(issueType),
            value: issueType.name,
            isNew: false,
            captionFor: this.captionFor
        });
        this.editing = issueType;
    }

    /**
     * The row view-models of the list, each with the label of the type.
     *
     * @property rows
     * @type Array
     * @public
     */
    get rows() {
        return this.issueTypes.map((type) => ({
            type,
            label: issueTypeRecordLabel(this.intl, type)
        }));
    }

    /**
     * The caption of the label field of a locale.
     *
     * @method captionFor
     * @param {String} locale
     * @return {String}
     * @protected
     */
    captionFor = (locale) => labelCaption(this.intl, locale, this.translations.defaultLocale, TYPE_LABEL_CAPTION_KEY);

    /**
     * The labels saved for the type, falling back to its built-in default label.
     *
     * @method savedLabels
     * @param {Prometheus.Models.Issuetype} issueType
     * @return {Object} The labels by locale
     * @protected
     */
    savedLabels(issueType) {
        let labels = { ...(issueType.translations ?? {}) };
        let defaultLocale = this.translations.defaultLocale;
        let key = `${ISSUE_TYPE_LABEL_PATH}.${issueType.name}`;

        if (!labels[defaultLocale] && this.intl.exists(key, defaultLocale)) {
            labels[defaultLocale] = this.intl.t(key, { locale: defaultLocale });
        }

        return labels;
    }

    /**
     * Sets the value of the type from the input, keeping the input in the allowed format.
     *
     * @method setValue
     * @param {Event} event
     * @protected
     */
    @action setValue(event) {
        this.form.name = event.target.value;
        event.target.value = this.form.name;
    }

    /**
     * Closes the modal and discards unsaved changes.
     *
     * @method removeModal
     * @protected
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;

        let record = this.editing;
        if (record) {
            if (record.isNew) {
                record.unloadRecord();
            } else {
                record.rollbackAttributes();
            }
        }
        this.editing = null;
        this.form = null;
        $('.modal').modal('hide');
    }

    /**
     * Validates and saves the issue type in the modal.
     *
     * @method saveIssueType
     * @protected
     */
    @action saveIssueType() {
        let record = this.editing;
        let form = this.form;
        let isNew = record.isNew;

        this.validate(form, 'issueTypeForm').then((validation) => {
            if (!validation.isValid) {
                this._showError(validation.errors, 'settings.issueTypes');
                return;
            }

            if (isNew) {
                record.name = form.name;
            }
            if (form.labelsChanged) {
                record.translations = form.translations;
            }

            record.save().then(() => {
                addIssueTypeLabels(this.intl, record.name, record.translations);

                if (isNew) {
                    this.issueTypes = [...this.issueTypes, record];
                }

                this.editing = null;
                this.form = null;
                $('.modal').modal('hide');

                new Messenger().post({
                    message: this.intl.t(
                        isNew ? 'views.app.settings.issueTypes.created' : 'views.app.settings.issueTypes.updated',
                        { name: issueTypeRecordLabel(this.intl, record), htmlSafe: true }
                    ),
                    type: 'success',
                    showCloseButton: true
                });
            }).catch(() => {
                new Messenger().post({
                    message: this.intl.t('views.app.settings.issueTypes.saveFailed'),
                    type: 'error',
                    showCloseButton: true
                });
            });
        });

        return false;
    }

    /**
     * Deletes a default issue type after Messenger confirmation. Projects keep
     * their own copies of the type.
     *
     * @method deleteIssueType
     * @param {Prometheus.Models.Issuetype} issueType
     * @protected
     */
    @action deleteIssueType(issueType) {
        let moduleName = this.intl.t('views.app.settings.issueTypes.singular');

        let deleting = new Messenger().post({
            message: this.intl.t('views.app.module.list.delete.message', {
                moduleName,
                name: issueTypeRecordLabel(this.intl, issueType),
                htmlSafe: true
            }),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(this.intl.t('views.app.module.list.delete.confirmDelete', { moduleName })).toString(),
                    action: () => {
                        deleting.update({
                            message: this.intl.t('views.app.module.list.delete.deleting', { moduleName }),
                            type: 'info',
                            actions: false,
                            hideAfter: false
                        });

                        return issueType.destroyRecord().then(() => {
                            this.issueTypes = this.issueTypes.filter((type) => type !== issueType);

                            return deleting.update({
                                message: this.intl.t('views.app.module.list.delete.deleted', { moduleName }),
                                type: 'success',
                                actions: false,
                                hideAfter: 3
                            });
                        }).catch(() => {
                            issueType.rollbackAttributes();

                            return deleting.update({
                                message: this.intl.t('views.app.module.list.delete.error', { moduleName }),
                                type: 'error',
                                actions: false,
                                hideAfter: 5
                            });
                        });
                    }
                },
                cancel: {
                    label: this.intl.t('views.app.module.list.delete.onsecondthought').toString(),
                    action: () => {
                        return deleting.update({
                            message: this.intl.t('views.app.module.list.delete.deletecancel'),
                            type: 'success',
                            actions: false,
                            hideAfter: 3
                        });
                    }
                }
            }
        });
    }
}
