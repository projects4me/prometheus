/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';
import format from "prometheus/utils/data/format";

/**
 * This is the route that will handle the creation of new issues
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gamil.com>
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
    afterModel(){
        Logger.debug('Prometheus.Routes.App.Project.Issue.Create::afterModel()');
        let _self = this;
        let projectId = _self.paramsFor('app.project').project_id;

        let projectOptions = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes',
            sort: "members.name",
            limit: -1
        };

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Create::afterModel()');

        return hash({
            issue: _self.store.createRecord('issue',{
                assignee : _self.get('currentUser').user.id,
                owner : _self.get('currentUser').user.id
            }),
            project: _self.store.query('project',projectOptions)
        }).then(function(results){
            console.log(results);
            _self.set('issue',results.issue);
            const issueDescription = _.clone(results.issue.description);
            _self.set('issueDescription',issueDescription);
            _self.set('project',results.project.objectAt(0));
            _self.set('types',results.project.firstObject.issuetypes);
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
        Logger.debug('Prometheus.Routes.App.Project.Issue.Create::setupController');

        let _self = this;

        let params = this.paramsFor('app.project.issue.edit');

        this.set('breadCrumb',{title:'#'+params.issue_number,record:true});
        controller.set('model', _self.get('issue'));
        controller.set('project', _self.get('project'));
        controller.set('types', _self.get('types'));
        controller.set('issueDescription',_self.get('issueDescription'));
        let priority = format.getList('views.app.issue.lists.priority',_self.get('i18n.locale'));
        let status = format.getList('views.app.issue.lists.status',_self.get('i18n.locale'));

        controller.set('status',status);
        controller.set('priority',priority);

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Create::setupController');
    },

    /**
     * This function is trigged on route exit. So on route exit we're destroying empty model of issue.
     *
     * @method resetController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     * @param {boolean} isExiting It returns boolean value telling that route is exiting or not.
     * @param {object} transition It gives us transition object in order to get current route name.
     * @private
     */
    resetController(controller, isExiting, transition) {
        if (isExiting && transition.targetName !== 'error') {
            if(!controller.model.id) {
                controller.model.destroyRecord();
            }
        }
    }

});