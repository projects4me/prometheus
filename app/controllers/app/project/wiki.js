import Ember from "ember";

/**
  The controller for the wiki route, it is loaded when a user tried to navigate to the route
  wiki
  e.g. acme.projects4.me/app/1/wiki
  By default this controller is configured to load the project selection

  @class AppProjectWiki
  @extends Ember.Controller
*/
export default Ember.Controller.extend({
  tree:{},

  actions: {
    save:function() {
      var model = this.get('model').nextObject(0);
      model.save();
    },
    create:function(){
      Logger.debug('Create a page for ');
      Logger.debug(this.get('projectId'));
      this.transitionToRoute('app.project.wiki.create', {projectId:this.get('projectId')});
    }
  }
});
