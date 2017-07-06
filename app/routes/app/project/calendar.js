/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import App from '../../app';

/**
  This is the route to load the conversations for a project

  @class AppProjectCalendarRoute
  @extends AppRoute
*/
export default App.extend({

  /**
    The requested module

    @property module
    @type String
    @for AppProjectCalendarRoute
    @private
  */
  module: 'issue',

  /**
    The data for the current route

    @property data
    @type Object
    @for AppProjectCalendarRoute
    @private
  */
  data: null,

  /**
    The query being used to load the calendar items

    @property query
    @type Integet
    @for AppProjectCalendarRoute
    @private
  */
  query:'',

  /**
    This controller is used to load the issues that we have in the system

    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  setupController:function(controller){
    Logger.debug('AppProjectCalendarRoute::setupController');

    var self = this;
    var params = this.paramsFor('app.project');

    self.loadIssues(params.projectId);

    var i18n = this.get('i18n');

    // Set the values in the controller
    controller.set('i18n',i18n);
    controller.set('projectId',params.projectId);
    controller.set('module',this.module);
  },

  /**
    This function is used to load the Issues List. This list is used in the
    message-box to allow users to mention issues in the project.

    @method loadIssues
    @param projectId
    @private
  */
  loadIssues:function(projectId){
    Logger.debug("AppProjectCalendarRoute::loadIssues("+projectId+")");
    var self = this;
    var module = "issue";

    var options = {
      fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.status,Issue.startDate,Issue.endDate,Issue.priority",
      query: "(Issue.projectId : "+projectId+")",
      rels: "assignee",
      sort: "Issue.startDate",
      order: "ASC",
      page: 0,
      limit:-1,
    };

    this.data = this.store.query(module,options).then(function(data){
      var issuesList = [];
      var issuesCount = data.get('length');
      var issue = null;
      for (var i=0; i<issuesCount;i++)
      {
        issue = data.nextObject(i);
        issuesList[i] = {
          id:issue.get('id'),
          title:'#'+issue.get('issueNumber')+' - '+issue.get('subject'),
          priority:issue.get('priority'),
          //allDate:true,
          start:issue.get('startDate')+'T09:00:00',
          end:issue.get('endDate')+'T18:00:00',
          number:issue.get('issueNumber'),
          className:issue.get('status'),
          url:"/app/"+projectId+"/issues/"+issue.get('id'),
          editable:false,
          startEditable:false,
          durationEditable:false,

        };
      }
      Logger.debug(issuesList);
      self.get('controller').set('events',issuesList);
    });
  },


});
