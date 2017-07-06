/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import App from "../app";

/**
  The wiki route

  @class AppProjectRoute
  @extends App
  @author Hammad Hassan gollomer@gmail.com
*/
export default App.extend({

  /**
    The project Id
    @property projectId
    @type String
    @for AppProjectRoute
    @private
  */
  projectId: null,

  /**
    The setup controller function that will be called every time the user visits
    the route, this function is responsible for loading the required data

    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  setupController:function(controller){

    Logger.debug('AppProjectRoute::setupController');

    // If the user navigated directly to the wiki project or page then lets setup the project id
    var projectId = this.paramsFor('app.project').projectId;
    var projectName = null;

    Logger.debug(projectId);
    Logger.debug(projectName);

    var options = {
      fields: "Project.id,Project.name",
      query: "(Project.id : "+projectId+")",
      rels : 'none',
      order: 'ASC',
      limit: 1
    };

    Logger.debug('Retreiving the project with options ');
    Logger.debug(options);

    this.data = this.store.query('project',options).then(function(data){
      if (projectId !== null)
      {
        projectName = data.findBy('id',projectId).get('name');
        controller.set('projectId',projectId);
        controller.set('projectName',projectName);
      }
      controller.set('model',data.nextObject(0));
    });
  }
});
