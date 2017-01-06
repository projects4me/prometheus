/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import MD from "../utils/metadata/metadata";
import ENV from "prometheus/config/environment";

/**
  This component is responsible for rendering the navigation bar in the application
  @class NavBarComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
   * This function fetches the navigation metaData and makes it available for display
   *
   * @method init
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
    The actions for the navigation bar, primarily used fo route transition
    @property actions
    @type Object
    @for nav-bar
    @private
  */
  actions:{
    navigate:function(route,routeParams,anchorRoute,projectId){
      Logger.debug('A transition requested to route '+route+' with params');
      Logger.debug(routeParams);
      if (routeParams === null)
      {
        routeParams = {};
      }
      if (projectId !== undefined)
      {
        routeParams['projectId'] = projectId;
      }
      Ember.set(this,'pathname','/'+this.appPrefix+'/'+anchorRoute);
      if (routeParams !== undefined && routeParams !== null && routeParams !== ''){
        this.get('router').transitionTo(route,routeParams);
      }
      else {
        this.get('router').transitionTo(route);
      }
    },

    /**
      This function is called when a project is selected

      @method projectChanged
      @param projectId {Object} The selected project
      @public
    */
    projectChanged:function(project){
      this.set('projectId',project.value);
      if (project.value !== undefined && project.value !== null && project.value !== ''){
        this.get('router').transitionTo('app.project',{projectId:project.value});
      }
    }
  }

});
