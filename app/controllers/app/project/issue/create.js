/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
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
export default Prometheus.extend({

    /**
     * This is the controller of the project, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    projectController: injectController('app.project'),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Create
     * @private
     */
    issuesList: computed('projectController.issuesList', function(){
        return this.get('projectController').get('issuesList');
    }),

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
         * This function is responsible for saving the model. After successfully
         * saving the function takes the user to the saved page.
         *
         * @method save
         * @public
         * @todo Trigger the notificaiton
         */
        save:function() {
            let _self = this;
            let model = this.get('model');

            model.validate().then(({ validations }) => {

                if (validations.get('isValid')) {
                    model.set('projectId',this.target.currentState.routerJs.state.params["app.project"].project_id);
                    model.set('reportedUser',_self.get('currentUser.user.id'));

                    model.set('startDate',moment(model.get('startDate')).format("YYYY-MM-DD"));
                    model.set('endDate',moment(model.get('endDate')).format("YYYY-MM-DD"));

                    model.save().then(function(data){
                        new Messenger().post({
                            message: _self.get('i18n').t('views.app.issue.created',{name:data.get('subject'),issue_number:data.get('issueNumber')}),
                            type: 'success',
                            showCloseButton: true
                        });

                        _self.transitionToRoute('app.project.issue.page', {project_id:data.get('projectId'),issue_number:data.get('issueNumber')});
                    });
                } else {
                    let messages = _self._buildMessages(validations,'issue');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
            });
        },

        /**
         * This function lets a user traverse to the issue list view of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
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
    }
});
