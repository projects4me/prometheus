/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';

/**
 * The controller for the wiki create route, it is loaded when a user clicks on
 * create button
 * e.g. acme.projects4.me/app/1/wiki/create
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
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
    saveDisabled: 'true',

    /**
     * This is the parentId of the wiki page that is being created. Initially
     * it is null
     *
     * @property parentId
     * @type String
     * @for Create
     * @private
     */
    parentId:'',

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
     * These are the event handled by this controller
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions: {

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
            model.save().then(function(data){
                Logger.debug('Data saved:');
                Logger.debug(data);
                _self.send('refreshWiki');

                new Messenger().post({
                    message: _self.get('i18n').t('views.app.wiki.created',{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

                _self.transitionToRoute('app.project.wiki.page', {project_id:data.get('projectId'),wiki_name:data.get('name')});
            });
        },

        /**
         * This function lets a user traverse to the main page of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
         */
        cancel:function(){
            let model = this.get('model');
            this.transitionToRoute('app.project.wiki', {project_id:model.get('projectId')});
        },

        /**
         * The function enables the save button
         *
         * @method changed
         * @public
         * @todo Trigger the notificaiton
         */
        changed:function(){
            Logger.debug('AppProjectWikiCreateController::changed()');
            let model = this.get('model');

            if (model.get('name') === undefined ||
                model.get('name') === null ||
                model.get('name') === '' ||
                model.get('markUp') === undefined ||
                model.get('markUp') === null ||
                model.get('markUp') === '' ||
                model.get('markUp') === '<p><br></p>')
            {
                this.set('saveDisabled',true);
            }
            else {
                this.set('saveDisabled',null);
            }
        },

        /**
         * This function sets the wikiId as the parent
         *
         * @method wikiChanged
         * @param {String} wiki
         * @public
         */
        wikiChanged:function(wiki){
            let model = this.get('model');
            this.set('parentId',wiki.value);
            model.set('parentId',wiki.value);
            model.set('parentName',wiki.label);
            this.send('changed');
        },

        /**
         * This is the action that is passed to used to get
         * changed from summernote following the data down
         * action up approach
         *
         * @method onContentChange
         * @param contents
         * @private
         */
        onContentChange:function (contents) {
            Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
            let _self = this;

            Logger.debug(_self);
            _self.get('model').set('markUp',contents);
            _self.send('changed');
            Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
        }

    }

});