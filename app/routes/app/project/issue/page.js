/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * The issues route
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

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
        Logger.debug('AppProjectIssuePageRoute::setupController');

        let _self = this;
    
        let params = _self.paramsFor('app.project.issue.page');

        _self.set('breadCrumb',{title:'#'+params.issue_number,record:true});

        _self.loadIssue(controller,params);

        let timelog = _self.store.createRecord('timelog');

        controller.set('newTimeLog',timelog);
        Logger.debug('-AppProjectIssuePageRoute::setupController');
    },

    /**
     * This function load the issue
     *
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Object} params
     */
    loadIssue(controller,params){
        let _self = this;

        let options = {
            query: '(Issue.issueNumber : '+params.issue_number+')',
            sort : 'Issue.issueNumber,comments.dateCreated',
            order: 'ASC',
            limit: -1,
        };

        _self.get('store').query('issue',options).then(function(data){
            controller.set('model', data);
            _self.setupActivities(controller,data);
        });
    },

    /**
     * This function is used to setup the activities for the issue
     *
     * @method setupActivities
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @private
     */
    setupActivities:function(controller,model){
        let activities = {};
        controller.set('activities',activities);
        Logger.debug('AppProjectIssuePageRoute::setupActivities');

        if (model.getEach('activities')[0] !== undefined)
        {
            // Group the activities with respect to the dateCreated
            model.getEach('activities')[0].forEach(function(activity){
                let dateCreated = activity.get('dateCreated').substring(0,10);
                if (activities[dateCreated] !== undefined)
                {
                    activities[dateCreated]['data'].push(activity);
                }
                else {
                    activities[dateCreated] = {dateCreated:dateCreated,data:[activity]};
                }
            });
            controller.set('activities',activities);
        }
        Logger.debug('-AppProjectIssuePageRoute::setupActivities');
    },

    actions: {

        reload(){
            let _self = this;
            Logger.debug('Reloading the route for issue page');
            Logger.debug(_self);
            let params = _self.paramsFor('app.project.issue.page');
            let controller = _self.get('controller');

            this.loadIssue(controller,params);
        }
    }

});