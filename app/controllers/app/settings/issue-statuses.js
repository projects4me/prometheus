/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import $ from 'jquery';
import { addIssueStatusLabels, issueStatusRecordLabel, ISSUE_STATUS_LABEL_PATH } from 'prometheus/utils/issue-status/label';
import { labelCaption } from 'prometheus/utils/issue-status/caption';
import IssueStatusForm from 'prometheus/utils/issue-status/form';
import { labelStyle, TEXT_COLORS } from 'prometheus/utils/color';

/**
 * The controller of the Issue Statuses page of the Settings area. Adds, edits,
 * reorders and deletes the global issue statuses.
 *
 * @class AppSettingsIssueStatusesController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends PrometheusCreateController
 */
export default class AppSettingsIssueStatusesController extends PrometheusCreateController {

    /**
     * The translations service, the supported locales
     *
     * @property translations
     * @type Prometheus.Services.TranslationsService
     * @private
     */
    @service translations;

    /**
     * The global issue statuses listed on the page, in board order.
     *
     * @property issueStatuses
     * @type Array
     * @public
     */
    @tracked issueStatuses = [];

    /**
     * The issue status being added or edited in the modal, null when it is closed.
     *
     * @property editing
     * @type Prometheus.Models.Issuestatus
     * @public
     */
    @tracked editing = null;

    /**
     * The labels and value typed in the modal, null when it is closed.
     *
     * @property form
     * @type Prometheus.Utils.IssueStatusForm
     * @public
     */
    @tracked form = null;

    /**
     * Validation schema definition of the issue status form.
     *
     * @property metadata
     * @type Object
     * @protected
     */
    metadata = {
        sections: [
            {
                name: 'issueStatusForm',
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
     * The statuses with the label to display: the label saved with the status in the
     * current language, else its translated name, else its name.
     *
     * @property rows
     * @type Array
     * @public
     */
    get rows() {
        return this.issueStatuses.map((status) => {
            return {
                status,
                // Only a hex colour becomes a style, so the server's value can't inject CSS.
                style: htmlSafe(labelStyle(status.color, { textColor: status.textColor })),
                label: issueStatusRecordLabel(this.intl, status),
                isUsed: status.issueCount > 0
            };
        });
    }

    /**
     * The sort order that places a new status after every existing one.
     *
     * @property nextSortOrder
     * @type Number
     * @public
     */
    get nextSortOrder() {
        let highest = this.issueStatuses.reduce((max, status) => Math.max(max, Number(status.sortOrder) || 0), 0);

        return highest + 1;
    }

    /**
     * The style of the label preview in the modal, the colour being picked.
     *
     * @property previewStyle
     * @type String
     * @public
     */
    get previewStyle() {
        return htmlSafe(labelStyle(this.form?.color, { textColor: this.form?.textColor }));
    }

    /**
     * The label text colours offered in the modal: dark and light.
     *
     * @property textColors
     * @type Array
     * @public
     */
    get textColors() {
        return Object.keys(TEXT_COLORS).map((value) => ({
            value,
            label: this.intl.t(`views.app.settings.issueStatuses.textColors.${value}`)
        }));
    }

    /**
     * The label text colour chosen in the modal, as one of `textColors`.
     *
     * @property selectedTextColor
     * @type Object
     * @public
     */
    get selectedTextColor() {
        return this.textColors.find((option) => option.value === this.form?.textColor);
    }

    /**
     * The text of the label preview in the modal: the label of the default locale, else
     * the value, else a placeholder.
     *
     * @property previewLabel
     * @type String
     * @public
     */
    get previewLabel() {
        return this.form?.defaultLabel || this.form?.name || this.intl.t('views.app.settings.issueStatuses.colorPreview');
    }

    /**
     * Opens the modal on a new global issue status, placed last.
     *
     * @method showAddDialog
     * @protected
     */
    @action showAddDialog() {
        this.message.issueStatusForm = {};
        this.form = new IssueStatusForm({
            locales: this.translations.locales,
            defaultLocale: this.translations.defaultLocale,
            captionFor: this.captionFor
        });
        this.editing = this.store.createRecord('issuestatus', {
            system: '1',
            done: '0',
            sortOrder: this.nextSortOrder,
            issueCount: 0
        });
    }

    /**
     * Opens the modal to edit the given issue status.
     *
     * @method showEditDialog
     * @param {Prometheus.Models.Issuestatus} issueStatus
     * @protected
     */
    @action showEditDialog(issueStatus) {
        this.message.issueStatusForm = {};
        this.form = new IssueStatusForm({
            locales: this.translations.locales,
            defaultLocale: this.translations.defaultLocale,
            translations: this.savedLabels(issueStatus),
            value: issueStatus.name,
            isNew: false,
            color: issueStatus.color,
            textColor: issueStatus.textColor,
            captionFor: this.captionFor
        });
        this.editing = issueStatus;
    }

    /**
     * The caption of a label field, worked out when the dialog opens (not while it renders).
     *
     * @method captionFor
     * @param {String} locale
     * @return {String}
     * @private
     */
    captionFor = (locale) => labelCaption(this.intl, locale, this.translations.defaultLocale);

    /**
     * The saved labels of a status. A status saved without labels shows the label
     * the app already has for it in the default locale, so it is not lost on save.
     *
     * @method savedLabels
     * @param {Prometheus.Models.Issuestatus} issueStatus
     * @return {Object} locale => label
     * @private
     */
    savedLabels(issueStatus) {
        let labels = { ...(issueStatus.translations ?? {}) };
        let defaultLocale = this.translations.defaultLocale;
        let key = `${ISSUE_STATUS_LABEL_PATH}.${issueStatus.name}`;

        if (!labels[defaultLocale] && this.intl.exists(key, defaultLocale)) {
            labels[defaultLocale] = this.intl.t(key, { locale: defaultLocale });
        }

        return labels;
    }

    /**
     * Sets the status value as the user types it, shown the way it is saved.
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
     * Sets the label text colour of the status in the modal.
     *
     * @method selectTextColor
     * @param {Object} option One of `textColors`
     * @protected
     */
    @action selectTextColor(option) {
        this.form.textColor = option.value;
    }

    /**
     * Sets whether the status in the modal counts as done.
     *
     * @method toggleDone
     * @param {Event} event
     * @protected
     */
    @action toggleDone(event) {
        this.editing.done = event.target.checked ? '1' : '0';
    }

    /**
     * Validates and saves the issue status in the modal.
     *
     * @method saveIssueStatus
     * @protected
     */
    @action saveIssueStatus() {
        let record = this.editing;
        let form = this.form;
        let isNew = record.isNew;

        this.validate(form, 'issueStatusForm').then((validation) => {
            if (!validation.isValid) {
                this._showError(validation.errors, 'settings.issueStatuses');
                return;
            }

            if (isNew) {
                record.name = form.name;
            }
            record.color = form.color;
            record.textColor = form.textColor;
            if (form.labelsChanged) {
                record.translations = form.translations;
            }

            record.save().then(() => {
                addIssueStatusLabels(this.intl, record.name, record.translations);

                if (isNew) {
                    this.issueStatuses = [...this.issueStatuses, record];
                }

                this.editing = null;
                this.form = null;
                $('.modal').modal('hide');

                new Messenger().post({
                    message: this.intl.t(
                        isNew ? 'views.app.settings.issueStatuses.created' : 'views.app.settings.issueStatuses.updated',
                        { name: issueStatusRecordLabel(this.intl, record), htmlSafe: true }
                    ),
                    type: 'success',
                    showCloseButton: true
                });
            }).catch(() => {
                new Messenger().post({
                    message: this.intl.t('views.app.settings.issueStatuses.saveFailed'),
                    type: 'error',
                    showCloseButton: true
                });
            });
        });

        return false;
    }

    /**
     * Moves a status to a new position and saves the new order of the statuses
     * that changed position.
     *
     * @method moveStatus
     * @param {Number} oldIndex
     * @param {Number} newIndex
     * @protected
     */
    @action moveStatus(oldIndex, newIndex) {
        let list = [...this.issueStatuses];
        let [moved] = list.splice(oldIndex, 1);
        list.splice(newIndex, 0, moved);
        this.issueStatuses = list;

        let changed = list.filter((status, index) => status.sortOrder !== index + 1);
        changed.forEach((status) => {
            status.sortOrder = list.indexOf(status) + 1;
        });

        Promise.allSettled(changed.map((status) => status.save())).then((results) => {
            if (results.every((result) => result.status === 'fulfilled')) {
                return;
            }

            // Some saves may have gone through, so show what the server stored.
            changed.forEach((status) => status.rollbackAttributes());

            return this.store.query('issuestatus', {
                query: '(Issuestatus.system : 1)',
                issueCount: true,
                sort: 'Issuestatus.sortOrder',
                order: 'ASC',
                limit: -1
            }).then((statuses) => {
                this.issueStatuses = statuses.toArray();
            }).finally(() => {
                new Messenger().post({
                    message: this.intl.t('views.app.settings.issueStatuses.reorderFailed'),
                    type: 'error',
                    showCloseButton: true
                });
            });
        });
    }

    /**
     * Deletes an issue status after Messenger confirmation. The page does not
     * offer this for a status that issues use, Gaia refuses it as well.
     *
     * @method deleteIssueStatus
     * @param {Prometheus.Models.Issuestatus} issueStatus
     * @protected
     */
    @action deleteIssueStatus(issueStatus) {
        let moduleName = this.intl.t('views.app.settings.issueStatuses.singular');

        let deleting = new Messenger().post({
            message: this.intl.t('views.app.module.list.delete.message', {
                moduleName,
                name: issueStatus.name,
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

                        return issueStatus.destroyRecord().then(() => {
                            this.issueStatuses = this.issueStatuses.filter((status) => status !== issueStatus);

                            return deleting.update({
                                message: this.intl.t('views.app.module.list.delete.deleted', { moduleName }),
                                type: 'success',
                                actions: false,
                                hideAfter: 3
                            });
                        }).catch(() => {
                            issueStatus.rollbackAttributes();

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
