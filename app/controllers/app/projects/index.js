/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from "prometheus/controllers/prometheus/list";
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import format from "prometheus/utils/data/format";

/**
 * This controller is used for the project list
 *
 * @class AppProjectsIndexController
 * @namespace Prometheus.Controllers
 * @module App.Projects
 * @extends List
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectsIndexController extends PrometheusListController {

    /**
     * The ezSearch schema of the projects, loaded by the route.
     *
     * @property querySchema
     * @type Object
     */
    @tracked querySchema = null;

    /**
     * What the shared ezSearch saved-search actions need for projects.
     *
     * @method savedSearchContext
     * @return {Object}
     */
    savedSearchContext() {
        return { relatedTo: 'project', messagePrefix: 'views.app.project.list.savedsearch' };
    }

    /**
     * This property stores the field on which the page if currently sored on
     *
     * @property sort
     * @for Index
     * @type String
     * @private
     */
    sort = 'Project.dateModified';

    /**
     * Formatted project status options for the mass update dialog.
     *
     * @property statusOptions
     * @type {Array}
     * @for AppProjectsIndexController
     * @public
     */
    get statusOptions() {
        return (new format(this)).getList('views.app.project.lists.status');
    }

    /**
     * This function is used to navigate the user to the detail page
     * for the project
     *
     * @method openDetail
     * @param {Prometheus.Model.Project} project the project model to which we have to navigate to
     * @public
     */
    @action openDetail(project) {
        Logger.debug("Prometheus.Controllers.Projects.Index::openDetail");
        this.router.transitionTo('app.project.index', { shortcode: project.shortCode });
        Logger.debug("-Prometheus.Controllers.Projects.Index::openDetail");
    }

    /**
     * Updates selected projects with values from the mass update model.
     *
     * @method massUpdateProject
     * @for AppProjectsIndexController
     * @public
     * @action
     */
    @action
    async massUpdateProject() {
        Logger.debug('AppProjectsIndexController::massUpdateProject');
        let selectedIds = this.getSelectedIds();
        let messenger = new Messenger().post({
            message: this.intl.t('views.app.module.list.massUpdate.updating', {moduleName: 'projects'}),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });

        try {
            for (let id of selectedIds) {
                let project = this.store.peekRecord('project', id);
                if (this.massUpdateModel.get('status')) {
                    project.set('status', this.massUpdateModel.get('status'));
                }
                await project.save();
            }
            messenger.update({
                message: this.intl.t('views.app.module.list.massUpdate.updated', {moduleName: 'Projects', count: selectedIds.length}),
                type: 'success',
                showCloseButton: true,
                hideAfter: 4
            });
        } catch (error) {
            messenger.update({
                message: this.intl.t('views.app.module.list.massUpdate.error', {moduleName: 'projects'}),
                type: 'error',
                showCloseButton: false,
                hideAfter: 4
            });
        }
        this.removeMassUpdateDialog();
        Logger.debug('-AppProjectsIndexController::massUpdateProject');
    }

    /**
     * This function is used to help navigate to the create project page
     *
     * @method createProject
     * @public
     */
    @action createProject() {
        Logger.debug("Prometheus.Controllers.Projects.Index::createProject()");
        this.router.transitionTo('app.projects.create');
        Logger.debug("-Prometheus.Controllers.Projects.Index::createProject()");
    }

    /**
     * This function is used to copy a public saved search
     *
     * @method copySearch
     * @public
     */
    @action copySearch(search) {
        Logger.debug('Prometheus.Controllers.Projects.Index->copySearch');
        let _self = this;

        let _savedSearch = _self.get('newSavedsearch');
        _savedSearch.set('relatedTo', 'project');
        _savedSearch.set('searchquery', search.get('searchquery'));
        _savedSearch.set('name', search.get('name'));
        _savedSearch.set('public', 0);

        _savedSearch.save().then(function (data) {
            _self.savedsearches = [..._self.savedsearches, data];
            let newSavedSearch = _self.get('store').createRecord('savedsearch');
            _self.set('newSavedsearch', newSavedSearch);

            new Messenger().post({
                message: _self.intl.t("views.app.project.list.savedsearch.copied", { name: data.get('name'), htmlSafe: true }),
                type: 'success',
                showCloseButton: true
            });

        });

        Logger.debug('-Prometheus.Controllers.Projects.Index->copySearch');
    }

    /**
     * This function is used to delete a saved search
     *
     * @method deleteSearch
     * @public
     */
    @action deleteSearch(search) {
        Logger.debug('Prometheus.Controllers.Projects.Index->deleteSearch');
        let _self = this;
        let toBeDeleted = _self.get('savedsearches').find((item) => item.id === search.get('id'));

        let deleting = new Messenger().post({
            message: _self.intl.t("views.app.project.list.savedsearch.delete", { name: search.get('name'), htmlSafe: true }),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: _self.intl.t("views.app.project.list.savedsearch.confirmdelete", { htmlSafe: true }),
                    action: function () {

                        // destroy the saved search
                        toBeDeleted.destroyRecord().then(function () {
                            // remove from the view by updating the model
                            _self.savedsearches = _self.savedsearches.filter((item) => item !== toBeDeleted);

                            return deleting.update({
                                message: _self.intl.t("views.app.project.list.savedsearch.deleted", { name: search.get('name'), htmlSafe: true }),
                                type: 'success',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: _self.intl.t("views.app.project.list.savedsearch.onsecondthought").toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("views.app.project.list.savedsearch.deletecancel", { htmlSafe: true }),
                            type: 'success',
                            actions: false
                        });
                    }
                },

            }
        });

        Logger.debug('-Prometheus.Controllers.Projects.Index->deleteSearch');
    }
}
