/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../app";

/**
 *  This is the route that will handle the creation of new issues
 *
 *  @class Create
 *  @namespace Prometheus.Routes
 *  @module App.Project.Issue
 *  @extends App
 *  @author Hammad Hassan <gollomer@gamil.com>
 */
export default App.extend({

    /**
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @protected
     */
    setupController:function(controller)
    {
        Logger.debug('AppProjectIndexRoute::setupController');

        let params = this.paramsFor('app.projects.edit');
        Logger.debug(params);

        let options = {
            query: '(Project.id : '+params.projectId+')',
            rels: 'none'
        };


        Logger.debug('Retrieving projects with options '+options);
        this.get('store').query('project',options).then(function(data){
            let project = data.nextObject(0);
            controller.set('model',project);
        });

        let type = [
            {
                "label":"Scrum",
                "value":"scrum"
            },
            {
                "label":"Kanban",
                "value":"kanban"
            },
            {
                "label":"Business",
                "value":"business"
            },
            {
                "label":"Other",
                "value":"other"
            }
        ];

        let status = [
            {
                "label":"New",
                "value":"new"
            },
            {
                "label":"In Progress",
                "value":"in_progress"
            },
            {
                "label":"Pending",
                "value":"pending"
            },
            {
                "label":"Completed",
                "value":"completed"
            },
            {
                "label":"Deferred",
                "value":"deferred"
            },
            {
                "label":"Closed",
                "value":"closed"
            },
        ];

        controller.set('status',status);
        controller.set('type',type);
    },

});
