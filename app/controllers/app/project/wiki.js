/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";


/**
 * The controller for the wiki route, it is loaded when a user tried to navigate to the route
 * wiki
 * e.g. acme.projects4.me/app/1/wiki
 * By default this controller is configured to load the project selection
 *
 * @class Wiki
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Ember.Controller
 */
export default Ember.Controller.extend({

    /**
     * This is the tree that we use in order to maintain the list of wiki pages for a particular project
     *
     * @property tree
     * @type Object
     * @for Wiki
     * @public
     */
    tree:{},

    /**
     * These are the event that are handled by this controller
     *
     * @property actions
     * @type Object
     * @for Wiki
     * @public
     */
    actions: {

        /**
         * This is the function that is used in order to save a wiki page
         *
         * @method save
         * @public
         */
        save:function() {
            var model = this.get('model').nextObject(0);
            model.save();
        },

        /**
         * This is the function that is used in order to navigate the user to the create page
         *
         * @method create
         * @public
         */
        create:function(){
            Logger.debug('Create a page for ');
            Logger.debug(this.get('projectId'));
            this.transitionToRoute('app.project.wiki.create', {projectId:this.get('projectId')});
        }
    }

});