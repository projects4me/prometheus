/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

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


  /**
    This function is used to retrieve and process the issues related to a project
    There are two reasons that the issues are being loaded separately and not
    part of the orginal call sent to retrive the project information. The first
    reason is performance, the numbder of issues on a large project can easily
    exceed 1000 issues and if we retireve the information along with project
    information due to the obviously complex nature of many relationships between
    a project and other entities the retrieval cost for even a single project
    would be in hundread of thousand of rows examined. So we only bring in the
    information that for there are going to be one a few decade rows in total
    with the original project retrieval call.
    The second reason is to retrive the related information. The API automatically`
    retireves the related data but is restricted to first degree relationships.
    Second degree and above relationships are not retrieved via the default call
    due to obvious performance and complexity constraints.

    @method loadIssuesTime
    @param projectId {String} The identifier of the project being viewed
    @todo Explore the possibility of using the url project/:id/:relation as it is supported by the API
  */
  loadIssuesTime:function(projectId){

    var self = this;
    var options = {
      query: "(Issue.projectId : "+projectId+")",
      sort: "Issue.dateModified",
      order: 'DESC',
      rels:'estimated,spent,project',
      limit: -1
    };

    this.store.query('issue',options).then(function(issues){
      self.get('controller').set('issuetime',issues);

      // We have to fetch the milestone list seperately as there might be a
      // project milestone with no issue associated with it
      var options = {
        query: "(Milestone.projectId : "+projectId+")",
        sort: "Milestone.startDate",
        order: 'DESC',
        rels:'none',
        limit: -1
      };
      self.store.query('milestone',options).then(function(milestones){
        milestones.forEach(function(milestone){
          var milestoneIssues = issues.filterBy('milestoneId',milestone.get('id'));
          if (milestoneIssues !== undefined)
          {
            milestone.get('issues').pushObjects(milestoneIssues);
          }
        });
        self.get('controller').set('milestones',milestones);
      });
    });
  },

  /**
    This function is used to retrive the activities related to a project. Just
    like the loadIssuesTime function the activities are loaded seperately to
    avoid performance and complexity issues.

    @method loadActivities
    @param projectId {String} The identifier of the project which is being viewed
    @todo test performance and load in chunks if required.
  */
  loadActivities:function(projectId){
    var self = this;
    var options = {
      // Retreiving the activities related to a project
      query: "((Activity.relatedId : "+projectId+") AND (Activity.relatedTo : project))",
      sort: "Activity.dateCreated",
      order: 'DESC',
      // Get all the activities
      limit: -1
    };

    this.store.query('activity',options).then(function(data){
      var activities = {};
      // Group the activities with respect to the dateCreated
      data.forEach(function(activity){
        var dateCreated = activity.get('dateCreated').substring(0,10);
        if (activities[dateCreated] !== undefined)
        {
          activities[dateCreated]['data'].push(activity);
        }
        else {
          activities[dateCreated] = {dateCreated:dateCreated,data:[activity]};
        }
      });

      self.get('controller').set('activities',activities);
    });
  },


});
