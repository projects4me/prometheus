import Ember from "ember";

/**
  The controller for the wiki create route, it is loaded when a user clicks on
  create button
  e.g. acme.projects4.me/app/1/wiki/create

  @class AppProjectWikiCreateController
  @extends Ember.Controller
*/
export default Ember.Controller.extend({

  /**
    This property is used to control the enabling and disabling of the save
    button, the save is only enabled if the current model has been modified

    @property saveDisabled
    @type String
    @for AppProjectWikiCreateController
    @private
  */
  saveDisabled: 'true',

  /**
    This is the parentId of the wiki page that is being created. Initially it is
    null

    @property
    @type String
    @for AppProjectWikiCreateController
    @private
  */
  parentId:'',

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
      this.set('parentId',wiki.value);
      model.set('parentId',wiki.value);
      model.set('parentName',wiki.label);
      this.send('changed');
    }

  }
});
