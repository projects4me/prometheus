/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../app";
/**
 * This is the route for projects list view
 *
 * @class Index
 * @namespace Prometheus.Routes.Projects
 * @module App
 * @extends AppRoute
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
    sort: 'Project.dateModified',

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
     * The model for this route
     *
     * @method model
     * @param params
     * @return Prometheus.Model.Project
     * @private
     */
    model:function(params){
        Logger.debug('Prometheus.App.Routes.Projects::model()');
        Logger.debug(params);

        let query = null;

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

        // Prepare the options
        let options = {
            query: query,
            rels: 'owner',
            sort: this.get('sort'),
            order: this.get('order'),
            page: this.get('page'),
        };

        // Retrieve the data
        let data = this.get('store').query('project',options);
        Logger.debug('-Prometheus.App.Routes.Projects::model()');
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
     * @param {Prometheus.Controllers.Projects.Index} controller The controller object for the projects
     * @param {Prometheus.Models.Project} model The model that is created by this route
     * @private
     */
    setupController:function(controller,model){
        Logger.debug('Prometheus.App.Routes.Projects::setupController()');
        controller.set('model',model);
        controller.set('query',this.get('query'));
        controller.set('sort',this.get('sort'));
        controller.set('order',this.get('order'));
        controller.set('page',this.get('page'));
        Logger.debug('Prometheus.App.Routes.Projects::setupController()');
    },

});