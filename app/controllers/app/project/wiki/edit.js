/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  The controller for the wiki edit route, it is loaded when a user clicks on the
  edit button on the wiki page
  e.g. acme.projects4.me/app/1/wiki/edit/Home

  @class AppProjectWikiEditController
  @extends Ember.Controller
  @todo Minimize the code
*/

export default Ember.Controller.extend({

  saveDisabled: 'true',
  /**
    The wiki list, this list is retrieved by the app.wiki.project route but
    since I do not want to send a network call to reteive the same list again
    I am making it accessible within the same route. This propert is set by
    the parent route.
    @property wikilist
    @type Object
    @for app.wiki.project.eidt
    @private
  */
//  wikilist: {},

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
      var model = this.get('model').nextObject(0);
      var changedAttributes = model.changedAttributes();
      var changed = false;
      for (var key in changedAttributes) {
        Logger.debug(key);
        changed = true;
      }
      Logger.debug(changed);
      if (changed){
        model.save().then(function(data){
          Logger.debug(data);

          if (changedAttributes['parentId'] !== undefined)
          {
            self.send('refreshWiki');
          }
          else if (changedAttributes['name'] !== undefined)
          {
            self.send('modelUpdated', data);
          }

          //model.reload();
          //self.set('markUp','');
          //self.destroy();
          //(self);
          //self.send('redirectOnSave',{projectId:data.get('projectId'),wikiName:data.get('name')});
          self.transitionToRoute('app.project.wiki.page', {projectId:data.get('projectId'),wikiName:data.get('name')});
        });
      }
    },

    /**
      This function lets a user traverse to the main page of the project
      @method cancel
      @public
      @todo Trigger the notificaiton
    */
    cancel:function(){
      var model = this.get('model').nextObject(0);
      this.transitionToRoute('app.project.wiki.page', {projectId:model.get('projectId'),wikiName:model.get('name')});
    },


    /**
      The function enables the save button
      @method changed
      @public
      @todo Trigger the notificaiton
    */
    changed:function(data){
      Logger.debug("AppProjectWikiEditController::changed()");
      Logger.debug("Something was updated");

      var model = this.get('model').nextObject(0);
      if (typeof(data) === 'object' && data.markUp !== undefined)
      {
        Logger.debug(model);
        model._internalModel._attributes['markUp'] = data.markUp;
        model.set('markUp',data.markUp);
      }
      var changedAttributes = model.changedAttributes();
      var changed = false;
      for (var key in changedAttributes) {
        Logger.debug(key);
        changed = true;
      }
      this.set('saveDisabled',null);

      if (changed)
      {
        this.set('saveDisabled',null);
      }
      else {
        this.set('saveDisabled',true);
      }
    },

    /**
      This function sets the wikiId as the parent
      @method wikiChanged
      @param target
      @param wikiName
      @public
    */
    wikiChanged:function(target){
      var model = this.get('model').nextObject(0);
      this.set('parentId',target.value);
      model.set('parentId',target.value);
      model.set('parentName',target.label);
      this.send('changed');
    },

    /**
      This function is used to select the tags in the system

      @method tagSelected
      @param e {Object} the list of selected items
    */
    tagSelected:function(e){
      Logger.debug('AppProjectWikiEditController:tagSelected');
      this.set('selectedTags',e);
    }
  }
});
