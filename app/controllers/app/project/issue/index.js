/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from "prometheus/controllers/prometheus/list";
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import format from "prometheus/utils/data/format";
import { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';

/**
 * This controller is used to provide the interaction between the template and
 * the route. The basic features that this controller provide are pagination,
 * sorting and filtering the data.
 *
 * @class AppProjectIssueIndexController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusListController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssueIndexController extends PrometheusListController {

    /**
     * This object holds all of the information that we need to create our schema and handle filtering
     * rules for the issues list.
     * @property metadata
     * @type Object
     * @for AppProjectIssueCreateController
     * @protected
     */
    metadata = {
        filters:[
            {
                id: 'Issue.issueNumber',
                label: this.intl.t("views.app.issue.fields.issueNumber"),
                type: 'string'
            },
            {
                id: 'Issue.subject',
                label: this.intl.t("views.app.issue.fields.subject"),
                type: 'string',
            },
            {
                id: 'Issue.status',
                label: this.intl.t("views.app.issue.fields.statusId"),
                type: 'string',
                input: 'select',
                get values() {
                    return this._controller.statuses;
                },
                _controller: this,
            },
            {
                id: 'issuemilestone.name',
                label: this.intl.t("views.app.issue.fields.milestoneId"),
                type: 'string'
            },
            {
                id: 'issuetype.name',
                label: this.intl.t("views.app.issue.fields.typeId"),
                type: 'string'
            },                                
            {
                id: 'Issue.priority',
                label: this.intl.t("views.app.issue.fields.priority"),
                type: 'string',
                input: 'select',
                values: (new format(this)).getTranslation('views.app.issue.lists.priority'),
            },
            {
                id: 'Issue.startDate',
                label: this.intl.t("views.app.issue.fields.startDate"),
                type: 'date',
                input: "text",
                plugin: 'datepicker',
                plugin_config: {
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true
                }
            },
            {
                id: 'Issue.endDate',
                label: this.intl.t("views.app.issue.fields.endDate"),
                type: 'date',
                input: "text",
                plugin: 'datepicker',
                plugin_config: {
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true
                }
            },
            {
                id: 'parentissue.issueNumber',
                label: this.intl.t("views.app.issue.fields.parent"),
                type: 'string'
            },
            {
                id: 'assignedTo.name',
                label: this.intl.t("views.app.issue.fields.assignee"),
                type: 'string'
            },
            {
                id: 'ownedBy.name',
                label: this.intl.t("views.app.issue.fields.owner"),
                type: 'string'
            },
            {
                id: 'reportedBy.name',
                label: this.intl.t("views.app.issue.fields.reportedBy"),
                type: 'string'
            }
        ]
    }    

    /**
     * This property stores the field on which the page if currently sored on
     *
     * @property sort
     * @type String
     * @for Issue
     * @private
     */
    sort = 'Issue.issueNumber';

    @controller('app.project.index')
    appProjectIndexController;

    /**
     * The currently selected issue for displaying in the sidebar
     *
     * @property selectedIssue
     * @type Object
     * @for AppProjectIssueIndexController
     */
    @tracked selectedIssue = null;

    /**
     * The full issue details loaded for the selected issue
     *
     * @property selectedIssueDetails
     * @type Object
     * @for AppProjectIssueIndexController
     */
    @tracked selectedIssueDetails = null;

    /**
     * Loading state for issue details
     *
     * @property isLoadingIssueDetails
     * @type Boolean
     * @for AppProjectIssueIndexController
     */
    @tracked isLoadingIssueDetails = false;    

    /**
     * The project controller
     *
     * @property projectController
     * @type Ember.Controller
     * @for AppProjectIssueIndexController
     */
    @controller('app.project') projectController;

    /**
     * The project data loaded for the selected issue
     *
     * @property projectData
     * @type Object
     * @for AppProjectIssueIndexController
     */
    @tracked projectData = null;

    /**
     * This function is used to navigate the user to the detail page for the issues
     *
     * @method openDetail
     * @param {Prometheus.Models.Issue} issue the issue model to which we have to navigate to
     * @public
     */
    @action openDetail(issue) {
        Logger.debug("AppProjectIssueController::openDetail");
        this.transitionToRoute('app.project.issue.page', issue.issueNumber);
        Logger.debug("-AppProjectIssueController::openDetail");
    }

    /**
     * This function is used to save a search
     *
     * @method saveSearch
     * @public
     */
    @action saveSearch() {
        Logger.debug('Prometheus.Controllers.Project.Issue->openSaveSearch');
        let _self = this;
        _self.send('searchByRules');
        let query = _self.get('query');
        Logger.debug(_self);

        if (query !== null) {
            let _savedSearch = _self.get('newSavedsearch');
            _savedSearch.set('relatedTo', 'issue');
            _savedSearch.set('searchquery', query);
            _savedSearch.set('projectId', _self.appProjectController.projectId);

            _savedSearch.save().then(function (data) {
                _self.get('savedsearches').pushObject(data);
                _self.set('newSavedsearch', {});

                new Messenger().post({
                    message: htmlSafe(_self.intl.t("views.app.issue.list.savedsearch.added", { name: data.get('name') })),
                    type: 'success',
                    showCloseButton: true
                });

            });
        } else {

            new Messenger().post({
                message: _self.intl.t("views.app.issue.list.savedsearch.missing"),
                type: 'error',
                showCloseButton: true
            });

        }

        _self.send('removeSaveSearchDialog');

        Logger.debug('-Prometheus.Controllers.Project.Issue->openSaveSearch');
    }

    /**
     * This function is used to copy a public saved search
     *
     * @method copySearch
     * @public
     */
    @action copySearch(search) {
        Logger.debug('Prometheus.Controllers.Project.Issue->copySearch');
        let _self = this;
        Logger.debug(search);

        let _savedSearch = _self.get('newSavedsearch');
        _savedSearch.set('relatedTo', 'issue');
        _savedSearch.set('searchquery', search.get('searchquery'));
        _savedSearch.set('projectId', _self.appProjectController.projectId);
        _savedSearch.set('name', search.get('name'));
        _savedSearch.set('public', 0);

        _savedSearch.save().then(function (data) {
            _self.get('savedsearches').pushObject(data);
            let newSavedSearch = _self.get('store').createRecord('savedsearch');
            _self.set('newSavedsearch', newSavedSearch);

            new Messenger().post({
                message: htmlSafe(_self.intl.t("views.app.issue.list.savedsearch.copied", { name: data.get('name') })),
                type: 'success',
                showCloseButton: true
            });

        });

        Logger.debug('-Prometheus.Controllers.Project.Issue->copySearch');
    }

    /**
     * This function is used to delete a saved search
     *
     * @method deleteSearch
     * @public
     */
    @action deleteSearch(search) {
        Logger.debug('Prometheus.Controllers.Project.Issue->deleteSearch');
        let _self = this;
        let toBeDeleted = _self.get('savedsearches').findBy('id', search.get('id'));

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.issue.list.savedsearch.delete", { name: search.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.issue.list.savedsearch.confirmdelete")),
                    action: function () {

                        // destroy the saved search
                        toBeDeleted.destroyRecord().then(function () {
                            // remove from the view by updating the model
                            _self.get('savedsearches').removeObject(toBeDeleted);

                            return deleting.update({
                                message: htmlSafe(_self.intl.t("views.app.issue.list.savedsearch.deleted", { name: search.get('name') })),
                                type: 'success',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: _self.intl.t("views.app.issue.list.savedsearch.onsecondthought").toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("views.app.issue.list.savedsearch.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                },

            }
        });

        Logger.debug('-Prometheus.Controllers.Project.Issue->deleteSearch');
    }

    /**
     * The translated list of the issue statuses.
     * 
     * @type {Object}
     * @for AppProjectIssueIndexController
     * @public
     */
    get statuses() {
        return this.issueStatuses?.reduce((acc, status) => {
            acc[status.name] = this.intl.t(`views.app.issue.lists.status.${status.name}`);
            return acc;
        }, {});
    }

    /**
     * This is a computed property that returns a formatted list of issue statuses
     * with their translated labels. The statuses are formatted using the format utility
     * to create a select-friendly list with translated status names.
     *
     * @property statusOptions
     * @type {Array}
     * @for AppProjectIssueIndexController
     * @public
     */
    get statusOptions() {
        return (new format(this)).getTranslatedModelList(this.issueStatuses, 'views.app.issue.lists.status');
    }

    /**
     * This is a computed property that returns a formatted list of issue priorities.
     *
     * @property priorityOptions
     * @type {Array}
     * @for AppProjectIssueIndexController
     * @public
     */
    get priorityOptions() {
        return (new format(this)).getList('views.app.issue.lists.priority');
    }

    /**
     * This is a computed property that returns a formatted list of milestones.
     *
     * @property milestoneOptions
     * @type {Array}
     * @for AppProjectIssueIndexController
     * @public
     */
    get milestoneOptions() {
        return (new format(this)).getSelectList(this.milestones, false, {isRequired: true});
    }

    /**
     * Updates multiple issues with the values from the mass update model.
     * This function iterates through all selected issues and updates their
     * status, priority, and milestone based on the values set in the mass update model.
     * It also handles the special case of updating the milestone relationship.
     * 
     * @method massUpdateIssue
     * @for AppProjectIssueIndexController
     * @public
     * @action
     */
    @action 
    async massUpdateIssue() {
        Logger.debug('AppProjectIssueIndexController::massUpdateIssue');
        let messenger = new Messenger().post({
            message: this.intl.t('views.app.module.list.massUpdate.updating', {moduleName: 'issues'}),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });

        let selectedIds = this.getSelectedIds();
        try{
            for(let id of selectedIds) {
                let issue = this.store.peekRecord('issue', id);
                let fields = ['statusId', 'priority', 'milestoneId'];
                let oldMilestoneId = issue.get('milestoneId');
                
                fields.forEach(field => {
                    if(this.massUpdateModel.get(field)) {
                        issue.set(field, this.massUpdateModel.get(field));
                    }
                });
    
                // Check if milestoneId has changed and update the relationship
                if (this.massUpdateModel.get('milestoneId') && oldMilestoneId !== this.massUpdateModel.get('milestoneId')) {
                    let newMilestone = this.store.peekRecord('milestone', this.massUpdateModel.get('milestoneId'));
                    issue.set('issuemilestone', newMilestone);
                }
    
                await issue.save();
            }
        } catch(error) {
            messenger.update({
                message: this.intl.t('views.app.module.list.massUpdate.error', {moduleName: 'issues'}),
                type: 'error',
                showCloseButton: false,
                hideAfter: 4
            });
        }
        messenger.update({
            message: this.intl.t('views.app.module.list.massUpdate.updated', {moduleName: 'Issues', count: this.selectedIds.length}),
            type: 'success',
            showCloseButton: true,
            hideAfter: 4
        });
        this.removeMassUpdateDialog();
        Logger.debug('-AppProjectIssueIndexController::massUpdateIssue');
    }

    /**
     * This action routes to the issue comments page and scrolls to the conversation section.
     * 
     * @method routeToIssueComments
     * @param {Prometheus.Models.Issue} issue
     * @public
     * @action
     */
    @action routeToIssueComments(issue) {
        Logger.debug('AppProjectIssueIndexController::routeToIssueComments');
        this.settings.scrollToElement = true;
        this.transitionToRoute('app.project.issue.page', issue.issueNumber);
        Logger.debug('-AppProjectIssueIndexController::routeToIssueComments');
    }

    /**
     * This action helps us set a static field value.
     * Since PrometheusListController doesn't have this method, we need to add it here.
     *
     * @method selectStatic
     * @param {Object} obj
     * @param {String} field
     * @param {Object} target
     * @public
     */
    @action selectStatic(obj, field, target) {
        obj.set(field, target);
    }

    /**
     * This action is used to select an issue for displaying in the sidebar
     *
     * @method selectIssue
     * @param {Object} issue The issue to select
     * @public
     */
    @action async selectIssue(issue) {
        Logger.debug("AppProjectIssueIndexController::selectIssue");
        this.selectedIssue = issue;
        this.isLoadingIssueDetails = true;
        window.scrollTo({top: 0, behavior: 'smooth'});
        await this.loadIssueDetails(issue);
        this.isLoadingIssueDetails = false;
        Logger.debug("-AppProjectIssueIndexController::selectIssue");
    }

    /**
     * This action is used to close the issue details sidebar
     *
     * @method closeIssueDetails
     * @public
     */
    @action closeIssueDetails() {
        Logger.debug("AppProjectIssueIndexController::closeIssueDetails");
        this.selectedIssue = null;
        this.selectedIssueDetails = null;
        this.isLoadingIssueDetails = false;
        Logger.debug("-AppProjectIssueIndexController::closeIssueDetails");
    }

    /**
     * This method loads the full issue details similar to the board page
     *
     * @method loadIssueDetails
     * @param {Object} issue The issue to load details for
     * @public
     */
    async loadIssueDetails(issue) {
        Logger.debug("AppProjectIssueIndexController::loadIssueDetails");
        let projectId = this.trackedProject.getProjectId();
        
        let options = {
            query: `((Issue.issueNumber : ${issue.issueNumber}) AND (Issue.projectId : ${projectId}))`,
            sort: 'Issue.issueNumber,comments.dateCreated',
            order: 'ASC',
            rels: 'comments,parentissue,assignedTo,ownedBy,modifiedBy,reportedBy,issuetype,files,spent,estimated,conversationroom,childissues,watchers',
            limit: -1,
        };

        let _projectOptions = {
            query: `(Project.id : ${projectId})`,
            rels: 'issuestatuses,issuetypes',
            limit: -1,
        };

        try {
            if(this.projectData === null) {
                let project = await this.store.query('project', _projectOptions);
                this.projectData = project.objectAt(0);
            }
            
            if(this.projectData.issuestatuses === undefined || this.projectData.issuestatuses.length === 0) {
                let issueStatuses = await this.store.query('issuestatus', {
                    query: `(Issuestatus.system : 1)`,
                    limit: -1,
                });
                this.projectData.issuestatuses = issueStatuses.toArray();
            }

            let issueResult = await this.store.query('issue', options);
            let fullIssue = issueResult.objectAt(0);

            this.selectedIssueDetails = fullIssue;
            this.issueTypes = this.projectData.issuetypes || [];
            this.issueStatuses = this.projectData.issuestatuses || [];

            Logger.debug("-AppProjectIssueIndexController::loadIssueDetails");
        } catch (error) {
            Logger.error("AppProjectIssueIndexController::loadIssueDetails - Error:", error);
            this.errorManager.handleError(error, {
                moduleName: 'issue'
            });
        }
    }
}