/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import App from "../../app";

/**
  The wiki route

  @class AppProjectIndexRoute
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

    Logger.debug('AppProjectIndexRoute::setupController');

    // If the user navigated directly to the wiki project or page then lets setup the project id
    var projectId = this.paramsFor('app.project').projectId;
    var projectName = null;

    Logger.debug(projectId);
    Logger.debug(projectName);

    this.loadIssuesTime(projectId);
    this.loadActivities(projectId);

    var options = {
//      fields: "Project.id,Project.name",
      query: "(Project.id : "+projectId+")",
      rels : 'members,conversations,createdBy,owner,memberships,roles',
      sort: "conversations.dateModified",
      order: 'ASC',
      limit: -1
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
  },

  loadIssuesTime:function(projectId){

    var self = this;
    var options = {
      query: "(Issue.projectId : "+projectId+")",
      sort: "Issue.dateModified",
      order: 'DESC',
      rels:'estimated,spent',
      limit: -1
    };

    this.store.query('issue',options).then(function(data){
      self.get('controller').set('issuetime',data);
    });
  },

  loadActivities:function(projectId){
    var self = this;
    var options = {
      query: "((Activity.relatedId : "+projectId+") AND (Activity.relatedTo : project))",
      sort: "Activity.dateCreated",
      order: 'DESC',
//      rels:'estimated,spent',
      limit: -1
    };

    this.store.query('activity',options).then(function(data){
      self.get('controller').set('activities',data);
    });
  },


});
