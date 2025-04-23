/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';
import _ from 'lodash';

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

        let projectId = _self.trackedProject.getProjectId();

        let wiki = this.store.createRecord('wiki',{
            status: 'published',
            locked: 0,
            upvotes: 1,
            projectId: projectId,
        });

        controller.set('model',wiki);
        controller.set('markUp', _.clone(wiki.markUp));
    },
});
