/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import $ from 'jquery';

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
     * The issue type being added or edited in the modal, null when it is closed.
     *
     * @property editing
     * @type Prometheus.Models.Issuetype
     * @public
     */
    @tracked editing = null;

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
        this.editing = issueType;
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
        let isNew = record.isNew;

        this.validate(record, 'issueTypeForm').then((validation) => {
            if (!validation.isValid) {
                this._showError(validation.errors, 'settings.issueTypes');
                return;
            }

            record.save().then(() => {
                if (isNew) {
                    this.issueTypes = [...this.issueTypes, record];
                }

                this.editing = null;
                $('.modal').modal('hide');

                new Messenger().post({
                    message: this.intl.t(
                        isNew ? 'views.app.settings.issueTypes.created' : 'views.app.settings.issueTypes.updated',
                        { name: record.name }
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
            message: htmlSafe(this.intl.t('views.app.module.list.delete.message', {
                moduleName,
                name: issueType.name
            })),
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
