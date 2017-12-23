/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import MD from "../utils/metadata/metadata";
import ENV from "prometheus/config/environment";

/**
 * This component is responsible for rendering the navigation bar in the application
 *
 * @class NavBar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * This function fetches the navigation metaData and makes it available for display
     *
     * @method init
     * @public
     */
    init:function(){
        Logger.debug('NavBarComponent::init()');
        this._super(...arguments);
        this.metaData = MD.create().getViewMeta('Navigation','items');
        Logger.debug(this.metaData);
        this.appPrefix = ENV.api.prefix;
        this.pathname = this.get('router.location.location.pathname');
    },

    /**
     * Initialize the sidebar
     *
     * @method didInsertElement
     * @public
     */
    didInsertElement(){
        let o = $.AdminLTE.options;
        Ember.$.AdminLTE.tree('.sidebar');
        //Add slimscroll to navbar dropdown
        Ember.$(".navbar .menu").slimscroll({
            height: o.navbarMenuHeight,
            alwaysVisible: false,
            size: o.navbarMenuSlimscrollWidth
        }).css("width", "100%");

        //Activate sidebar push menu
        $.AdminLTE.pushMenu.activate(o.sidebarToggleSelector);
    },

    /**
     * The actions for the navigation bar, primarily used fo route transition
     *
     * @property actions
     * @type Object
     * @for NavBar
     * @public
     */
    actions:{

        /**
         * This function is used in order to handle navigation to our desired route
         *
         * @method navigate
         * @param {String} route
         * @param {Object} routeParams
         * @param {String} anchorRoute
         * @param {String} projectId
         * @public
         */
        navigate:function(route,routeParams,anchorRoute,projectId){
            Logger.debug('A transition requested to route '+route);
            if (projectId !== undefined)
            {
                if (routeParams === null)
                {
                    routeParams = {};
                }
                routeParams['projectId'] = projectId;
            }
            this.set('pathname','/'+this.appPrefix+'/'+anchorRoute);
            if (routeParams !== undefined && routeParams !== null && routeParams !== ''){
                this.get('router').transitionTo(route,routeParams);
            }
            else {
                this.get('router').transitionTo(route);
            }
        },

        /**
         * This function is called when a project is selected
         *
         * @method projectChanged
         * @param {String} projectId The selected project
         * @public
         */
        projectChanged:function(project){
            this.set('projectId',project.value);
            if (project.value !== undefined && project.value !== null && project.value !== ''){
                this.get('router').transitionTo('app.project',{projectId:project.value});
            }
        }
    }

});