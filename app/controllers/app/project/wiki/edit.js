/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import _ from "lodash";

const { inject: { service } } = Ember;

/**
  The controller for the wiki edit route, it is loaded when a user clicks on the
  edit button on the wiki page
  e.g. acme.projects4.me/app/1/wiki/edit/Home

  @class AppProjectWikiEditController
  @extends Ember.Controller
  @todo Minimize the code
*/

export default Ember.Controller.extend({
  addTagDialog: false,

  /**
    This is the store service which is used to interact with the data API

    @property store
    @type Service
    @for AppProjectWikiPageController
    @private
  */
  store: service(),

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
      this.send('syncTags');
    },

    /**
      This function is used to select the tags in the system

      @method tagSelected
      @param e {Object} the list of selected items
    */
    addTag:function(){
      Logger.debug('AppProjectWikiEditController:addTag');
      var tag = {label:this.get('tagName'),value:'_new'};
      Logger.debug(this.get('tagName'));
      Logger.debug(this.get('selectedTags'));

      var selectedTags = this.get('selectedTags');

      selectedTags = _.concat(selectedTags,tag);

      this.set('selectedTags',selectedTags);
      this.set('tagName','');

      Ember.$('.modal').modal('hide');
      this.set('addTagDialog',false);

      Logger.debug(this.get('selectedTags'));

      this.send('syncTags');
    },

    removeTag:function(tag){
      Logger.debug('AppProjectWikiEditController:removeTag');
      Logger.debug(tag);
      Logger.debug(this.get('selectedTags'));

      var selectedTags = this.get('selectedTags');

      selectedTags = _.pull(selectedTags,tag);

      this.set('selectedTags',selectedTags);

      Logger.debug(this.get('selectedTags'));
      this.send('syncTags');
    },

    showDialog:function()
    {
      this.set('addTagDialog',true);
    },

    removeModal:function(){
      this.set('addTagDialog',false);
    },

    syncTags:function(){
      Logger.debug('AppProjectWikiEditController::syncTags()');
      var selectedTags = this.get('selectedTags');
      var tagList = this.get('tagList');
      var tags = this.get('model').nextObject(0).get('tagged');
      var self = this;

      Logger.debug(tagList);
      Logger.debug(tags);
      Logger.debug(selectedTags);

      var newTags = selectedTags.filterBy('value',"_new");
      var newTagObjects = [];
      Logger.debug('The new tags are ');
      Logger.debug(newTags);
      var newTagCount = newTags.length;

      for (var tagIdx=0; tagIdx < newTagCount;tagIdx++ ) {
        console.log('A new tag is to be addedd');

        newTagObjects[tagIdx] = this.get('store').createRecord('tag',{
          dateCreated:'CURRENT_DATETIME',
          dateModified:'CURRENT_DATETIME',
          deleted:0,
          createdUser:'1',
          modifiedUser:'1',
          tag:newTags[tagIdx].label,
          createdUserName: 'Hammad Hassan',
          modifiedUserName: 'Hammad Hassan',
        });

        newTagObjects[tagIdx].save().then(function(tag){
          new Messenger().post({
            message: "Tag by the name <strong>"+tag.get('tag')+"</strong> saved",
            type: 'success',
            showCloseButton: true
          });

          selectedTags = _.pull(selectedTags,newTags[0]);
          selectedTags = _.concat(selectedTags,{label:tag.get('tag'),value:tag.get('id')});
          self.set('selectedTags',selectedTags);
          Logger.debug(selectedTags);

          var tagged = self.get('store').createRecord('tagged',{
            tagId : tag.get('id'),
            relatedId : self.get('model').nextObject(0).get('id'),
            relatedTo: "wiki"
          });
          tagged.save();
        });
      }

      this.send('changed');
    }


  }
});
