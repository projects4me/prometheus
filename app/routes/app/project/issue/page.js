/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import App from "../../../app";

/**
  The issues route

  @class AppProjectIssuePageRoute
  @extends App
  @author Hammad Hassan gollomer@gmail.com
*/
export default App.extend({

  /**
    The model for this route

    @method model
    @param params
    @return IssueModel
    @private
  */
  model:function(params){
    Logger.debug('AppProjectIssuePageRoute::model()');
    Logger.debug(params);

    var options = {
      query: '(Issue.issueNumber : '+params.issueNumber+')',
      sort : 'Issue.issueNumber',
      order: 'ASC',
      limit: -1,
      //rels: 'none'
    };
    this.set('breadCrumb',{title:'#'+params.issueNumber,record:true});
    Logger.debug('Retreiving issue with options '+options);
    var data = this.get('store').query('issue',options);
    Logger.debug('-AppProjectIssuePageRoute::model()');
    return data;
  },

  /**
    This function is called by the route when it has cretaed the controller and
    the controller is ready to be setup with any data that we may need. We are
    using this function in order to bind the model of the route to the model
    of the controller.

    The setup controller is only called once and if the model is changed Ember
    reflects the change in the controller as well.

    @method setupController
    @param controller {AppProjectIssueController} The controller object for the issues
    @param model {IssueModel} The model that is preated by this route
    @private
  */
  setupController:function(controller,model){
    Logger.debug('AppProjectIssuePageRoute::setupController');

    if (typeof model.get !== 'function'){
      model = this.model(this.paramsFor('app.project.issue.page'));
    }
    this.setupActivities(controller,model);
    controller.set('model',model);
    controller.set('options',[
                                {'label':'Item 1','value':'1'},
                                {'label':'Item 2','value':'2'},
                                {'label':'Item 3','value':'3'},
                                {'label':'Item 4','value':'4'},
                                {'label':'Item 5','value':'5'}
                              ]);
    Logger.debug('-AppProjectIssuePageRoute::setupController');
  },

  setupActivities:function(controller,model){
    var activities = {};
    Logger.debug('AppProjectIssuePageRoute::setupActivities');

    if (model.getEach('activities')[0] !== undefined)
    {
      // Group the activities with respect to the dateCreated
      model.getEach('activities')[0].forEach(function(activity){
        var dateCreated = activity.get('dateCreated').substring(0,10);
        if (activities[dateCreated] !== undefined)
        {
          activities[dateCreated]['data'].push(activity);
        }
        else {
          activities[dateCreated] = {dateCreated:dateCreated,data:[activity]};
        }
      });
      controller.set('activities',activities);
    }
    Logger.debug('-AppProjectIssuePageRoute::setupActivities');
  }
});
