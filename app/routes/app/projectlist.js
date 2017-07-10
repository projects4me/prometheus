/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../app";
import Ember from "ember";
import MD from "../../utils/metadata/metadata";
import ENV from "../../config/environment";

/**
 * The module route, it is loaded when a user tried to navigate to
 * the route :module e.g. acme.projects4.me/app/projects/
 *
 * @class Projectlist
 * @namespace Prometheus.Routes
 * @module App
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The requested module
     *
     * @property module
     * @type String
     * @for Projectlist
     * @private
     */
    module: null,

    /**
     * The data for the current route
     *
     * @property data
     * @type Object
     * @for Projectlist
     * @private
     */
    data: null,

    /**
     * The meta data for the detail view for the requested module
     *
     * @property metaData
     * @type Object
     * @for Projectlist
     * @private
     */
    metaData:null,

    /**
     * The selected items in the list view
     *
     * @property selectedCount
     * @type Integer
     * @for Projectlist
     * @private
     */
    selectedCount:0,

    /**
     * The internationalization service
     *
     * @property selectedCount
     * @type Service
     * @for Projectlist
     * @private
     */
    i18n: Ember.inject.service(),

    /**
     * The setup controller function that will be called every time the user visits
     * the module route, this function is responsible for loading the required data
     * for the route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Projectlist} controller the controller object for this route
     * @private
     */
    setupController:function(controller,model){
        Logger.debug("AppProjectListRoute");
        // Get the parameters for the current route every time as they might change from one record to another
        var params = this.paramsFor('app.projectlist');
        Logger.debug("Params are");
        Logger.debug(params);

        params['module'] = 'project';
        // Set the data in the current instance of the object, this is required. Unless this is done the route will display the same data every time
        this.module = Ember.String.capitalize(params.module);
        //var metaData = MD.create();
        var i18n = this.get('i18n');
        controller.set('i18n',i18n);
        this.metaData = MD.create().getViewMeta(this.module,'list',i18n);
        model = this.loadData();

        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('model',model);
        controller.set('module',this.module);
        controller.set('metaData',this.metaData);
        controller.setupController();
    },

    /**
     * This function is used in order to load the data for the list view
     *
     * @method loadData
     * @return {Object}
     * @private
     */
    loadData:function(){
        var params = this.paramsFor('app.projectlist');
        Logger.debug(params);
        params['module'] = 'project';
        var controller = this.get('controller');

        // is the controller has already been setup then use the params from there.
        if (controller !== undefined)
        {
            params.page = controller.get('page');
            params.query = controller.get('query');
            params.sort = controller.get('sort');
            params.order = controller.get('order');
        }

        // Set the data in the current instance of the object, this is required. Unless this is done the route will display the same data every time
        this.module = Ember.String.capitalize(params.module);
        //var metaData = MD.create();
        var options = {
            limit: ENV.app.list.pagelimit,
            rels : 'createdBy,modifiedBy,owner'
        };
        if (params.page !== undefined && params.page !== '' &&  params.page !== null) {
            options.page = params.page;
        }
        else {
            options.page = 0;
        }

        if (params.query !== undefined && params.query !== '' &&  params.query !== null) {
            options.query = params.query;
        }

        if (params.sort !== undefined && params.sort !== '' &&  params.sort !== null) {
            options.sort = params.sort;
        }

        if (params.order !== undefined && params.order !== '' &&  params.order !== null) {
            options.order = params.order;
        }
        this.data = this.store.query(this.module,options);

        if (controller !== undefined)
        {
            controller.set('model',this.data);
        }
        this.set('model',this.data);
        return this.data;
    },


    // /**
    //  * This function is called by Ember after it has loaded the Model. We are calling it
    //  * so as to override the App's afterModel
    //  *
    //  * @method afterModel
    //  * @protected
    //  */
    // afterModel:function(){
    //   this._super(...arguments);
    // },

    /**
     * These are the actions handled by this route
     *
     * @property actions
     * @type Object
     * @for Projectlist
     * @public
     */
    actions: {

        /**
         * This function is used to reload the route when required
         *
         * @method refreshRoute
         * @param {Object} params
         * @public
         */
        refreshRoute:function(params){
            Logger.debug('Trying to so what you wanted, hope you know what you are doing !!!');
            this.transitionTo(params);
            this.loadData();
        }

    }

});