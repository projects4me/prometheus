/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../../app";

/**
 * The issues route
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * We need to reload the model as the values related ot the page's data are
     * changed so we are relying on the queryParams provided by Ember to reload
     * the model as the following parameter are changed.
     *
     * @property queryParams
     * @type Object
     * @for Index
     * @private
     */
    queryParams:{
        sort:{
            refreshModel:true,
        },
        order:{
            refreshModel:true,
        },
        page:{
            refreshModel:true,
        },
        query:{
            refreshModel:true,
        }
    },

    /**
     * The field on which we want to sort by default
     *
     * @property sort
     * @type String
     * @for Index
     * @private
     */
    sort: 'Issue.issueNumber',

    /**
     * The order in which to sort by
     *
     * @property order
     * @type String
     * @for Index
     * @private
     */
    order: 'desc',

    /**
     * The default page that we need to load
     *
     * @property page
     * @type Integer
     * @for Index
     * @private
     */
    page: 1,

    /**
     * The default query that we need to load
     *
     * @property query
     * @type String
     * @for Index
     * @private
     */
    query: '',

    /**
     * The identifier of the project that we need to load the issues for
     *
     * @property projectId
     * @type String
     * @for Index
     * @private
     */
    projectId: null,


    /**
     * The model for this route
     *
     * @method model
     * @param params
     * @return Prometheus.Models.Issue
     * @private
     */
    model:function(params){
        Logger.debug('AppIssueRoute::model()');
        Logger.debug(params);

        var query = null;

        // Load the data if are passed via the parameter
        if(params.sort){
            this.set('sort',params.sort);
        }
        if(params.order){
            this.set('order',params.order);
        }
        if(params.query){
            query = params.query;
            this.set('query',params.query);
        }
        if(params.page){
            this.set('page',params.page);
        }

        // Get the projectId from the parent
        var projectId = this.paramsFor('app.project').projectId;
        Logger.debug('ProjectId : '+projectId);

        // Make sure that projectId is set for every query
        if(query === null){
            query = '(Issue.projectId : '+projectId+')';
        }
        else{
            query = '(('+query+') AND (Issue.projectId : '+projectId+'))';
        }

        // Prepare the options
        var options = {
            query: query,
            rels: 'ownedBy,assignedTo,milestone,project,createdBy,modifiedBy,reportedBy',
            sort: this.get('sort'),
            order: this.get('order'),
            page: this.get('page'),
        };

        // Retrieve the data
        var data = this.get('store').query('issue',options);
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
        controller.set('model',model);
        controller.set('query',this.get('query'));
        controller.set('sort',this.get('sort'));
        controller.set('order',this.get('order'));
        controller.set('page',this.get('page'));
    },

});