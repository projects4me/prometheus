/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import App from '../../app';

/**
  This is the route to load the conversations for a project

  @class AppProjectConversationRoute
  @extends AppRoute
*/
export default App.extend({

  /**
    The requested module
    @property module
    @type String
    @for app.module
    @private
  */
  module: 'conversationroom',

  /**
    The data for the current route
    @property data
    @type Object
    @for app.module
    @private
  */
  data: null,

  /**
    The selected items in the list view
    @property selectedCount
    @type Integet
    @for app.module
    @private
  */
  selectedCount:0,

  /**
    This controller is used to load the conversations that we have in the system

    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  setupController:function(controller){

    Logger.debug('AppProjectConversationRoute::setupController');

    var self = this;
    var params = this.paramsFor('app.project');

    // Get the parameters for the current route every time as they might change from one record to another
    //var params = this.paramsFor('app.conversations');

    // Set the data in the current instance of the object, this is required. Unless this is done the route will display the same data every time
    //this.module = Ember.String.capitalize(this.module);
    //var metaData = MD.create();
    var i18n = this.get('i18n');
    controller.set('i18n',i18n);

    //this.metaData = MD.create().getViewMeta(this.module,'list',i18n);
    var options = {
      //limit: ENV.app.list.pagelimit
      limit:-1,
      page: 0
    };

    if (params.query !== undefined && params.query !== '' &&  params.query !== null) {
      options.query = params.query;
    }

    options.order = 'ASC';
    options.sort = 'comments.dateModified, Conversationroom.dateModified';
    options.query = "(Conversationroom.projectId : "+params.projectId+")";
    this.data = this.store.query(this.module,options).then(function(data){
      controller.set('model',data);
      Logger.debug('------------------------');
      Logger.debug(self);
      Logger.debug(data);
      Logger.debug(data.getEach('id'));
      Logger.debug(data.getEach('project'));
      Logger.debug(data.getEach('createdBy'));
      Logger.debug('------------------------');
    });


    // Set the data in the controller so that any data bound in the view can get re-rendered
    controller.set('module',this.module);
    //controller.set('metaData',this.metaData);
    //controller.setupController();
  }
});
