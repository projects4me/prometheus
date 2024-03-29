/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Create from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import format from "prometheus/utils/data/format";
import _ from "lodash";

/**
 * This is the controller for issue create page
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Create.extend(ProjectRelated, {

    /**
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module: 'issue',

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    appController: injectController('app'),

    /**
     * This milestones available for this project
     *
     * @property milestoneList
     * @type Array
     * @for Create
     * @public
     */
    milestoneList: computed('project', function () {
        return format.getSelectList(this.project.milestones, false, this.i18n.t('global.blank'));
    }),

    /**
     * This issue types available for the project
     *
     * @property typeList
     * @type Array
     * @for Create
     * @public
     */
    typeList: computed('types', function () {
        return format.getSelectList(this.types);
    }),

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    usersList: computed('appController.usersList', function () {
        return this.appController.get('usersList');
    }),

    /**
     * This estimates for this issue
     *
     * @property estimates
     * @type Array
     * @for Create
     * @private
     */
    estimates: [],

    /**
     * This function sets the model properties before saving it
     *
     * @method beforeSave
     * @param model
     */
    beforeSave(model) {
        model.set('projectId', this.target.currentState.routerJsState.params["app.project"].project_id);
        model.set('reportedUser', this.currentUser.user.id);
        model.set('startDate', moment(model.get('startDate')).format("YYYY-MM-DD"));
        model.set('endDate', moment(model.get('endDate')).format("YYYY-MM-DD"));
    },

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return this.i18n.t('views.app.issue.created', {
            name: model.get('subject'),
            issue_number: model.get('issueNumber')
        });
    },

    /**
     * This function navigate a user to the issue detail page
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        this.transitionToRoute('app.project.issue.page', {
            project_id: model.get('projectId'),
            issue_number: model.get('issueNumber')
        });
    },

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 2);
    },

    /**
     * This function navigates a use to the issue list view.
     *
     * @method afterCancel
     * @param projectId
     * @protected
     */
    afterCancel() {
        let projectId = this.target.currentState.routerJsState.params["app.project"].project_id;
        this.transitionToRoute('app.project.issue', { project_id: projectId });
    },

    /**
     * This function is used to allow search on both the issues name and
     * the issue number
     *
     * @method parentMatcher
     * @param issue
     * @param term
     * @return {Number}
     */
    parentMatcher(issue, term) {
        return `#${issue.number} - ${issue.name}`.toLowerCase().indexOf(term);
    },

    /**
     * These are the actions supported by this controller
     *
     * @property actions
     * @for Object
     * @public
     */
    actions: {

        /**
         * This function is used to set the parent for the issue
         *
         * @param model
         * @param field
         * @param target
         */
        changedParent(model, field, target) {
            model.set(field, target.id);
        },
        // search(query) {
        //     console.log(query);
        // }
    },
});
