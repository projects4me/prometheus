/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Projects
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

    /**
     * This property is used to control the enabling and disabling of the save
     * button, the save is only enabled if the current model has been modified
     *
     * @property saveDisabled
     * @type String
     * @for Create
     * @private
     */
    saveDisabled: null,

    /**
     * We are pre-loading the project issues and the users in the
     * system when a use navigates to the project view. Inside the
     * this page we are simply fetching the information stored in
     * the project controller. For that purpose we are loading injecting
     * the project controller controller inside this controller.
     *
     * @property projectController
     * @type Prometheus.Controllers
     * @for Create
     * @private
     */
    appController: injectController('app'),

    /**
     * This is a computed property in which gets the list of users
     * in the system loaded by the project controller
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
         * This function is called when an assignee is being selected
         *
         * @method selectOwner
         * @param {Object} target
         * @public
         */
        selectOwner(target)
        {
            Logger.debug('App.Projects.Create:selectAssignee');
            let model = this.get('model');
            model.set('assignee',target.value);
            Logger.debug('App.Projects.Create:selectAssignee');
        },

        /**
         * This function is called when the status is being selected
         *
         * @method selectStatus
         * @param {Object} target
         * @public
         */
        selectStatus(target)
        {
            Logger.debug('App.Projects.Create:selectStatus');
            let model = this.get('model');
            model.set('status',target.value);
            Logger.debug('App.Projects.Create:selectStatus');
        },

        /**
         * This function is called when the priority is being selected
         *
         * @method selectType
         * @param {Object} target
         * @public
         */
        selectType(target)
        {
            Logger.debug('App.Projects.Create:selectType');
            let model = this.get('model');
            model.set('type',target.value);
            Logger.debug('App.Projects.Create:selectType');
        },

        /**
         * This function is called when the start date field is changed
         *
         * @method startDateChanged
         * @param {String} date
         * @public
         */
        startDateChanged(date) {
            Logger.debug('Prometheus.App.Projects.Edit.Controller::startDateChanged('+date+')');
            if (this.get('model') !== undefined) {
                this.get('model').set('startDate', date);
            }
            Logger.debug('Prometheus.App.Projects.Edit.Controller::startDateChanged');
        },

        /**
         * This function is called when the end date field is changed
         *
         * @method endDateChanged
         * @param {String} date
         * @public
         */
        endDateChanged(date) {
            Logger.debug('Prometheus.App.Projects.Edit.Controller::endDateChanged('+date+')');
            if (this.get('model') !== undefined) {
                this.get('model').set('endDate', date);
            }
            Logger.debug('Prometheus.App.Projects.Edit.Controller::endDateChanged');
        },

        /**
         * This function is responsible for saving the model. After successfully
         * saving the function takes the user to the saved page.
         *
         * @method save
         * @public
         * @todo Trigger the notificaiton
         */
        save() {
            let _self = this;
            let model = _self.get('model');

            model.modifiedUser = _self.get('currentUser.user.id');
            model.modifedUserName = _self.get('currentUser.user.name');

            // model.startDate = moment(model.startDate).format("YYYY-MM-DD");
            // model.endDate= moment(model.endDate).format("YYYY-MM-DD");

            Logger.debug(model);
            Logger.debug(_self);
            model.save().then(function(data){
                Logger.debug('Data saved:');
                Logger.debug(data);

                new Messenger().post({
                    message: _self.get('i18n').t('views.app.project.edit.saved',{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

                _self.transitionToRoute('app.project.index', {project_id:data.get('id')});
            });
        },

        /**
         * This function lets a user traverse to the issue list view of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
         */
        cancel(){
            this.transitionToRoute('app.projects');
        },
    }

});
