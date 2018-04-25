/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../../app";
import { hash } from 'rsvp';
import _ from "lodash";

/**
 * The issues edit route
 *
 * @class Edit
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * We are using dynamic segments and since model is not called
     * again for a route that is using dynamic segment we are relying
     * on the afterModel hook so that the controller waits since we
     * return a Promise.
     *
     * @method model
     * @param {Object} params
     * @return Prometheus.Issue
     * @private
     */
    afterModel(model, transition){
        Logger.debug('Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        let _self = this;
        let params = transition.params;

        let projectId = params['app.project'].project_id;
        let issueNumber = model.issue_number;

        let projectOptions = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes',
            sort: "members.name",
            limit: -1
        };

        let issueOptions = {
            query: '(Issue.issueNumber : '+issueNumber+')',
            sort : 'Issue.issueNumber',
            order: 'ASC',
            limit: -1,
            //rels: 'none'
        };

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        return hash({
            issue: _self.get('store').query('issue',issueOptions),
            project: _self.store.query('project',projectOptions)
        }).then(function(results){
            _self.set('issue',results.issue.objectAt(0));
            _self.set('project',results.project.objectAt(0));
            _self.set('types',results.project.objectAt(0).get('issuetypes'));
        });
    },

    /**
     * This function is called by the route when it has created the controller and
     * the controller is ready to be setup with any data that we may need. We are
     * using this function in order to bind the model of the route to the model
     * of the controller.
     *
     * The setup controller is only called once and if the model is changed Ember
     * reflects the change in the controller as well.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     * @param {Prometheus.Models.Issue} model The model that is created by this route
     * @private
     */
    setupController:function(controller){
        Logger.debug('AppProjectIssueEditRoute::setupController');

        let _self = this;

        let params = this.paramsFor('app.project.issue.edit');

        this.set('breadCrumb',{title:'#'+params.issue_number,record:true});

        controller.set('model',_self.get('issue'));
        controller.set('project',_self.get('project'));
        controller.set('types',_self.get('types'));

        let priority = [
            {
                "label":"Medium",
                "value":"medium"
            },
            {
                "label":"High",
                "value":"high"
            },
            {
                "label":"Low",
                "value":"low"
            },
            {
                "label":"Critical",
                "value":"critical"
            },
            {
                "label":"Bloker",
                "value":"blocker"
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
                "label":"Done",
                "value":"done"
            },
            {
                "label":"Wont't Fix",
                "value":"wont_fix"
            }
        ];

        controller.set('status',status);
        controller.set('priority',priority);

        Logger.debug('-AppProjectIssueEditRoute::setupController');
    },

});