/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This is the index page of the project, index page for the project is
 * basically the detail page for it.
 *
 * @class Index
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

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
         * This action is used to allow navigation to a user to a project related
         * page
         *
         * @method navigateToProjectPage
         * @param {String} entity This is the entity the user wants to navigate to
         * @param {String} query The params passed in the format of encoded URL string
         * @public
         */
        navigateToProjectPage:function(entity,query){
            Logger.debug("AppProjectIndexController::navigateToProjectPage("+entity+","+query+")");
            this.transitionToRoute('app.project.'+entity,{projectId:this.get('projectId')});
        }

    }

});