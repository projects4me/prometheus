/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Create from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import format from "../../../../utils/data/format";

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
    milestoneList: computed('project', function(){
        return format.getSelectList(this.get('project.milestones'));
    }),

    /**
     * This issue types available for the project
     *
     * @property typeList
     * @type Array
     * @for Create
     * @public
     */
    typeList: computed('types', function(){
        return format.getSelectList(this.get('types'));
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
    usersList: computed('appController.usersList', function(){
        return this.get('appController').get('usersList');
    }),

    /**
     * These are the events that this controller handles
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions:{

        /**
         * This function lets a user traverse to the issue list view of the project
         *
         * @method cancel
         * @public
         * @todo move cancel to create controller
         */
        cancel:function(){
            let _self = this;
            let projectId = _self.target.currentState.routerJs.state.params["app.project"].project_id;
            let model = _self.get('model');

            if (_.size(model.changedAttributes()) > 2) {
                let message = new Messenger().post({
                    message: _self.get('i18n').t("views.app.issue.create.cancelcicked").toString(),
                    type: 'warning',
                    showCloseButton: true,
                    actions: {
                        confirm: {
                            label: _self.get('i18n').t("views.app.issue.create.confirmcancel").toString(),
                            action: function() {
                                message.cancel();
                                _self.transitionToRoute('app.project.issue', {project_id:projectId});
                            }
                        },
                        cancel: {
                            label: _self.get('i18n').t("views.app.issue.create.onsecondthought").toString(),
                            action: function() {
                                message.cancel();
                            }
                        },

                    }
                });
            } else {
                _self.transitionToRoute('app.project.issue', {project_id:projectId});
            }
        },
    },

    /**
     * This function sets the model properties before saving it
     *
     * @param model
     */
    beforeSave(model){
        model.set('projectId', this.target.currentState.routerJs.state.params["app.project"].project_id);
        model.set('reportedUser',this.get('currentUser.user.id'));
        model.set('startDate',moment(model.get('startDate')).format("YYYY-MM-DD"));
        model.set('endDate',moment(model.get('endDate')).format("YYYY-MM-DD"));
    },

    getSuccessMessage(model){
        return this.get('i18n').t('views.app.issue.created',{
            name:model.get('subject'),
            issue_number:model.get('issueNumber')
        });
    },

    navigateToSuccess(model){
        this.transitionToRoute('app.project.issue.page', {
            project_id:model.get('projectId'),
            issue_number:model.get('issueNumber')
        });
    }

});
