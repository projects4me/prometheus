/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  The controller for the wiki page route, it is loaded when a user tried to
  navigate to a particular wiki page

  e.g. acme.projects4.me/app/1/wiki/Home
  By default this controller is configured to load the project selection

  @class AppProjectWikiPageController
  @extends Ember.Controller
*/

export default Ember.Controller.extend({

  actions: {

    /**
      Load the eidt page
      @method edit
      @public
      @todo Trigger the notificaiton
    */
    edit:function() {
      var model = this.get('model').nextObject(0);
      this.transitionToRoute('app.project.wiki.edit', {projectId:model.get('projectId'),wikiName:model.get('name')});
    },

    /**
      This function is used to navigate the user to the parent Id
      @method loadWiki
      @public
    */
    loadWiki(projectId,wikiName){
      this.transitionToRoute('app.project.wiki.page', {projectId:projectId,wikiName:wikiName});
    },

    /**
      This function is called when the user presses the create button
      @method create
      @public
    */
    create:function(){
      Logger.debug('Create a page for ');
      Logger.debug(this.get('projectId'));
      this.transitionToRoute('app.project.wiki.create', {projectId:this.get('projectId')});
    },

    /**
      This function is called when the user presses the delete button
      @method delete
      @public
    */
    delete:function(){
      alert('No can\'t do');
    }

  }
});
