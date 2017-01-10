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

    Logger.debug('Retreiving issue with options '+options);
    var data = this.get('store').query('issue',options);
    Logger.debug(data);
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
    if (model.issues !== undefined)
    {
      model = model.issues.filterBy('issueNumber',model.issueNumber)[0];
    }
    else if (typeof model.nextObject === 'function'){
      model = model.nextObject(0);
      // Load relavent data
    }
    Logger.debug("AppProjectIssuePageController");
    Logger.debug(model);
    controller.set('model',model);
    //var params = this.paramsFor('app.project.issue.page');
    //Logger.debug(params);
  },
});
