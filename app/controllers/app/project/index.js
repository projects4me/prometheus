import Ember from "ember";

/**
  This is the index page of the project, index page for the project is
  basically the detail page for it.

  @class AppProjectIndexController
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

    /**
      This action is used to allow navigation to a user to a project related
      page

      @method navigateToProjectPage
      @param entity {String} This is the entity the user wants to navigate to
      @param query {String} The params passed in the format of encoded URL string
      @public
    */
    navigateToProjectPage:function(entity,query){
      Logger.debug("AppProjectIndexController::navigateToProjectPage("+entity+","+query+")");
      this.transitionToRoute('app.project.'+entity,{projectId:this.get('projectId')});
    }
  }
});
