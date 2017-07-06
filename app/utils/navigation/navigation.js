/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ENV from "prometheus/config/environment";
//import Ember from "ember";

/**
 * This utility class is used for help the interaction with the API
 * @class navigation
 * @module App.utils
 */
export default {
  /**
   * This function generates a basic form for the URL required by Ember.Route's transitionToRoute function
   *
   * @method buildURL
   * @param entity {String} The entity name that the user wants to navigate to e.g. projects
   * @param action {String} The action that the user wants to navigate to e.g. detail, create, etc
   * @param params {Object} The addition params that are to be passed over to Ember.Route
   * @return routeData {Object} The object that transitionToRoute and transitionTo accepts
   * @todo support all possible routes
   */
  buildURL:function(entity,action,params){
    var route = (action !== undefined && action !== null && action !== '')?ENV.api.prefix+'.'+action:ENV.api.prefix;
    var routeData = {
      route: route,
      options: {
        module:entity,
      }
    };
    for (var attrname in params) { routeData.options[attrname] = params[attrname];}
    return routeData;
  }
};
