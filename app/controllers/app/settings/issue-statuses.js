/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import $ from 'jquery';

/**
 * The colours an issue status may use, the palette Gaia accepts.
 *
 * @property STATUS_COLORS
 * @type Array
 */
export const STATUS_COLORS = [
    { value: '#80b5d3', name: 'blue' },
    { value: '#b3244f', name: 'crimson' },
    { value: '#f7bf65', name: 'amber' },
    { value: '#5ac594', name: 'green' },
    { value: '#e98a7e', name: 'salmon' }
].map((color) => ({ ...color, style: htmlSafe(`background:${color.value}`) }));

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
     * The colour swatches offered in the modal.
     *
     * @property colors
     * @type Array
     * @public
     */
    colors = STATUS_COLORS;

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
     * The statuses with the label to display. The label is the translated name
     * so the page is multi-lingual, statuses without a translation show their name.
     *
     * @property rows
     * @type Array
     * @public
     */
    get rows() {
        return this.issueStatuses.map((status) => {
            let key = `views.app.issue.lists.status.${status.name}`;

            // The colour is only used as a style when it is one of the palette, it comes from the server.
            let color = STATUS_COLORS.find((swatch) => swatch.value === status.color);

            return {
                status,
                style: color ? color.style : '',
                label: this.intl.exists(key) ? this.intl.t(key) : status.name,
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
     * Opens the modal on a new global issue status, placed last.
     *
     * @method showAddDialog
     * @protected
     */
    @action showAddDialog() {
        this.message.issueStatusForm = {};
        this.editing = this.store.createRecord('issuestatus', {
            system: '1',
            color: STATUS_COLORS[0].value,
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
        this.editing = issueStatus;
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
     * Picks the colour of the status in the modal.
     *
     * @method selectColor
     * @param {String} color
     * @protected
     */
    @action selectColor(color) {
        this.editing.color = color;
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
        let isNew = record.isNew;

        this.validate(record, 'issueStatusForm').then((validation) => {
            if (!validation.isValid) {
                this._showError(validation.errors, 'settings.issueStatuses');
                return;
            }

            record.save().then(() => {
                if (isNew) {
                    this.issueStatuses = [...this.issueStatuses, record];
                }

                this.editing = null;
                $('.modal').modal('hide');

                new Messenger().post({
                    message: this.intl.t(
                        isNew ? 'views.app.settings.issueStatuses.created' : 'views.app.settings.issueStatuses.updated',
                        { name: record.name, htmlSafe: true }
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
