import Ember from "ember";

/**
  The controller for the wiki route, it is loaded when a user tried to navigate to the route
  wiki
  e.g. acme.projects4.me/app/1/wiki
  By default this controller is configured to load the project selection

  @class AppProjectWikiController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({

  /**
    These are the actions that we are going to handle for this controller

    @property actions
    @type Object
    @for AppProjectWikiController
    @public
  */
  actions: {
    create:function(){
      Logger.debug('AppProjectWikiController::setupController');
      Logger.debug(this.get('model.projectId'));
      this.transitionToRoute('app.project.wiki.create', {projectId:this.get('model.projectId')});
    }
  }
});
