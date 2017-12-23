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
     * We use the after model hook here in order to load the
     * system issue types
     */
    afterModel(){
        let _self = this;

        let issuetypeOptions = {
            query: '(Issuetype.system : 1)',
            limit: -1
        };

        return Ember.RSVP.hash({
            issuetypes: _self.store.query('issuetype',issuetypeOptions),
        }).then(function(results){
            _self.set('issuetypes',results.issuetypes.toArray());
        });

    },

    /**
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @protected
     * @todo Store static lists elsewhere
     */
    setupController:function(controller,model)
    {
        Logger.debug('AppProjectIndexRoute::setupController');
        let _self = this;
        let i18n = _self.get('i18n');

        controller.set('issuetypes',_self.get('issuetypes'));

        let project = _self.get('store').createRecord('project');
        controller.set('model',project);

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
