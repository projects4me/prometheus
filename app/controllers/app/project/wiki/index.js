/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";

/**
 * The controller for the wiki route, it is loaded when a user tried to navigate to the route
 * wiki
 * e.g. acme.projects4.me/app/1/wiki
 * By default this controller is configured to load the project selection
 *
 * @class Index
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

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
            let projectId = this.target.currentState.routerJsState.params["app.project"].project_id;
            this.transitionToRoute('app.project.wiki.create', {project_id:projectId});
        }

    }

});