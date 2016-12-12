import Ember from "ember";

/**
  The controller for the wiki create route, it is loaded when a user clicks on
  create button
  e.g. acme.projects4.me/app/wiki/1/create
  @class app.wiki.project.create
  @module app
  @submodule Controller
  @namespace Prometheus
  @extends Ember.Controller
*/
export default Ember.Controller.extend({


  saveDisabled: 'true',

  actions: {
    /**
      This function is responsible for saving the model. After successfully
      saving the function takes the user to the saved page.
      @method save
      @public
      @todo Trigger the notificaiton
    */
    save:function() {
      var self = this;
      var model = this.get('model');
      model.save().then(function(data){
        Logger.debug('Data saved:');
        Logger.debug(data);
        self.send('refreshWiki');
        self.transitionToRoute('app.project.wiki.page', {projectId:data.get('projectId'),wikiName:data.get('name')});
      });
    },

    /**
      This function lets a user traverse to the main page of the project
      @method cancel
      @public
      @todo Trigger the notificaiton
    */
    cancel:function(){
      var model = this.get('model');
      this.transitionToRoute('app.project.wiki', {projectId:model.get('projectId')});
    },


    /**
      The function enables the save button
      @method changed
      @public
      @todo Trigger the notificaiton
    */
    changed:function(){
      var model = this.get('model');
      if (model.get('name') === undefined ||
            model.get('name') === null ||
            model.get('name') === '' ||
            model.get('markUp') === undefined ||
            model.get('markUp') === null ||
            model.get('markUp') === '' ||
            model.get('markUp') === '<p><br></p>')
      {
        this.set('saveDisabled',true);
      }
      else {
        this.set('saveDisabled',null);
      }
    },

    /**
      This function sets the wikiId as the parent
      @method wikiChanged
      @param target
      @param wikiName
      @public
    */
    wikiChanged:function(wiki){
      var model = this.get('model');
      model.set('parentId',wiki.value);
      model.set('parentName',wiki.label);
      this.send('changed');
    }

  }
});
