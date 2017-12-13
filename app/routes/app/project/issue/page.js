/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../../app";

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
     * The model for this route
     *
     * @method model
     * @param {Object} params
     * @return Prometheus.Issue
     * @private
     */
    model:function(params){
        Logger.debug('AppProjectIssuePageRoute::model()');
        Logger.debug(params);

        let options = {
            query: '(Issue.issueNumber : '+params.issueNumber+')',
            sort : 'Issue.issueNumber',
            order: 'ASC',
            limit: -1,
            //rels: 'none'
        };
        this.set('breadCrumb',{title:'#'+params.issueNumber,record:true});
        Logger.debug('Retreiving issue with options '+options);
        let data = this.get('store').query('issue',options);
        Logger.debug('-AppProjectIssuePageRoute::model()');
        return data;
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
    setupController:function(controller,model){
        Logger.debug('AppProjectIssuePageRoute::setupController');

        let i18n = this.get('i18n');
        controller.set('i18n',i18n);

        if (typeof model.get !== 'function'){
            model = this.model(this.paramsFor('app.project.issue.page'));
        }
        this.setupActivities(controller,model);

        controller.set('model',model);
        Logger.debug('-AppProjectIssuePageRoute::setupController');
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
        var activities = {};
        Logger.debug('AppProjectIssuePageRoute::setupActivities');

        if (model.getEach('activities')[0] !== undefined)
        {
            // Group the activities with respect to the dateCreated
            model.getEach('activities')[0].forEach(function(activity){
                var dateCreated = activity.get('dateCreated').substring(0,10);
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

});