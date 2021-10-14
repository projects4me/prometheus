/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import MD from "prometheus/utils/metadata/metadata";
import ENV from "../../config/environment";
import { inject } from '@ember/service';
import { capitalize} from '@ember/string';

/**
 * The module route, it is loaded when a user tried to navigate to the route :module e.g. acme.projects4.me/app/projects/
 *
 * @class Module
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
     * @for Module
     * @private
     */
    module: null,

    /**
     * The data for the current route
     *
     * @property data
     * @type Object
     * @for Module
     * @private
     */
    data: null,

    /**
     * The meta data for the detail view for the requested module
     *
     * @property metaData
     * @type Object
     * @for Module
     * @private
     */
    metaData:null,

    /**
     * The selected items in the list view
     *
     * @property selectedCount
     * @type Integer
     * @for Module
     * @private
     */
    selectedCount:0,

    /**
     * The internationalization service
     *
     * @property i18n
     * @type Service
     * @for Module
     * @private
     */
    i18n: inject(),

    /**
     * The setup controller function that will be called every time the user visits
     * the module route, this function is responsible for loading the required data
     * for the route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Module} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        // Get the parameters for the current route every time as they might change from one record to another
        var params = this.paramsFor('app.module');

        // Set the data in the current instance of the object, this is required. Unless this is done the route will display the same data every time
        this.module = capitalize(params.module);
        //var metaData = MD.create();
        var i18n = this.i18n;
        controller.set('i18n',i18n);
        this.metaData = MD.create().getViewMeta(this.module,'list',i18n);
        var options = {
            limit: ENV.app.list.pagelimit
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
        //console.log(this);

        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('model',this.data);
        controller.set('module',this.module);
        controller.set('metaData',this.metaData);
        //controller.setupController();
    }

});