/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';

/**
 * The controller for the wiki route, it is loaded when a user tried to navigate to the route
 * wiki
 * e.g. acme.projects4.me/app/1/wiki
 * By default this controller is configured to load the project selection
 *
 * @class Index
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({

    /**
     * These are the actions that we are going to handle for this controller
     *
     * @property actions
     * @type Object
     * @for Index
     * @public
     */
    actions: {

        /**
         * This function is used to navigate the user to the create route
         *
         * @method create
         * @public
         */
        create:function(){
            Logger.debug('AppProjectWikiController::setupController');
            Logger.debug(this.get('model.projectId'));
            this.transitionToRoute('app.project.wiki.create', {projectId:this.get('model.projectId')});
        }

    }

});