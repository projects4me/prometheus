/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';

/**
 * This is the create route for the wiki pages section
 *
 * It is loaded when a user tried to navigate to the route
 *
 * :projectId/wiki/create e.g. acme.projects4.me/app/123/wiki/create
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Project.Wiki
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Prometheus.Routes.Wiki.Create
     * @public
     */
    currentUser: inject(),

    /**
     * The setup controller function that will be called every time the user visits the module route,
     * this function is responsible for loading the required data for the route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Wiki} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        let _self = this;

        let params = _self.getParams();

        let wiki = this.store.createRecord('wiki',{
            status:'published',
            locked:0,
            upvotes:1,
            projectId:params.projectId,
        });

        controller.set('model',wiki);
    },

    /**
     * This function retrieves the route parameters, Most of the wiki functionality
     * is similar so we one write it once and extends it for different routes.
     * In order to make sure that we are able to retrieve the correct parameters we
     * have exposed this function.
     *
     * @method getParams
     * @return {Object} params The parameters for this route
     * @private
     */
    getParams:function(){
        let params = {};
        params['projectId'] = this.paramsFor('app.project').project_id;
        return params;
    }
});
