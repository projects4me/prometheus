import  format from "../../../utils/data/format";
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import { hash } from 'rsvp';
import _ from 'lodash';

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class Create
 * @namespace Prometheus.Controller.Projects
 * @module App
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({


    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Create
     * @public
     */
    currentUser: inject('current-user'),

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Create
     * @public
     */
    i18n: inject(),

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
     * This is a computed property that generated the project short
     * code automatically based on the project name
     *
     * @property shortCode
     * @type String
     * @for Create
     * @public
     * @todo optimize the short code generation algorithm to reduce conflicts
     */
    shortCode: computed('model.name', function(){
        let name = '';
        if (this.get('model.name') !== undefined) {
            name = this.get('model.name');
        }
        let shortCode = name.replace(/[^a-zA-Z]+/g,'');
        shortCode = shortCode.slice(0,5).toUpperCase();

        return shortCode;
    }),

    /**
     * This is a computed property in which gets the list of issue
     * types in the system
     *
     * @property issuetypeList
     * @type Array
     * @for Create
     * @private
     */
    issuetypeList: computed('issuetypes', function(){
        return format.getSelectList(this.get('issuetypes'));
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

            let selectedIssuetypes = _self.get('selectedIssuetypes');

            model.set('modifiedUser',_self.get('currentUser.user.id'));
            model.set('createdUser',_self.get('currentUser.user.id'));
            model.set('modifedUserName',_self.get('currentUser.user.name'));
            model.set('createdUserName',_self.get('currentUser.user.name'));
            model.set('shortCode',_self.get('shortCode'));
            model.set('deleted','0');

            model.set('startDate',moment(model.get('startDate')).format("YYYY-MM-DD"));
            model.set('endDate',moment(model.get('endDate')).format("YYYY-MM-DD"));

            Logger.debug(model);
            Logger.debug(_self);
            model.save().then(function(data){
                Logger.debug('Data saved:');
                Logger.debug(data);
                let Promises = {};

                _.forEach(selectedIssuetypes,function(issueType){
                    let newIssueType = _self.get('store').createRecord('issuetype',{
                        name: issueType.label,
                        deleted: 0,
                        description: issueType.label,
                        createdUser: _self.get('currentUser.user.id'),
                        modifiedUser: _self.get('currentUser.user.id'),
                        system: 0,
                        projectId: data.get('id')
                    });
                    Promises[issueType.label] = newIssueType.save();
                });

                hash(Promises).then(function(){

                    new Messenger().post({
                        message: _self.get('i18n').t('views.app.project.create.created',{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });

                    _self.transitionToRoute('app.project.index', {project_id:data.get('id')});

                });

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

        /**
         * This function is called when an issuetype is selected
         *
         * @method issuetypeSelected
         * @param {*} issue
         * @public
         */
        issuetypeSelected(issue){
            Logger.debug('Prometheus.Controllers.App.Projects.Create::issuetypeSelected');

            let _self = this;
            _self.set('selectedIssuetypes',issue);

            Logger.debug('-Prometheus.Controllers.App.Projects.Create::issuetypeSelected');
        }
    }

});
