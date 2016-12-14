/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import App from "../../../app";

/**
  The module route, it is loaded when a user tried to navigate to the route
  :wikiName e.g. acme.projects4.me/app/wiki/1/Home

  @class AppProjectWikiPage
  @extends AppRoute
*/
export default App.extend({

  /**
    The data for the current route
    @property data
    @type Object
    @for app.wiki.project.page
    @private
  */
  data: null,

  /**
    The current project
    @property data
    @type Object
    @for app.wiki.project.page
    @private
  */
  project: {},

  /**
    The wiki list, this list is retrieved by the app.wiki.project route but
    since I do not want to send a network call to reteive the same list again
    I am making it accessible within the same route. This propert is set by
    the parent route.
    @property wikilist
    @type Object
    @for app.wiki.project.page
    @private
  */
  wikilist: {},

  /**
    The setup controller function that will be called every time the user visits the module route, this function is responsible for loading the required data for the route
    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  setupController:function(controller){
    Logger.debug('Wiki Route');
    Logger.debug(this);

    var params = this.getParams();
    Logger.debug('The parameters are as follows');
    Logger.debug(params);

    Logger.debug('Inside the setup controller for the wiki page');
    var i18n = this.get('i18n');
    controller.set('i18n',i18n);

    this.project = this.store.findRecord('project',params.projectId,{rels:'none'});

    controller.set('projectId',params.projectId);

    var options = {
      query: '((Wiki.name : '+params.wikiName+') AND (Wiki.projectId : '+params.projectId+'))',
      sort : 'Wiki.name',
      order: 'ASC',
      limit: 1
    };

    Logger.debug('Retreiving wiki list with options '+options);
    this.data = this.store.query('wiki',options).then(function(data){
      controller.set('model',data);
      controller.set('markUp',data.nextObject(0).get('markUp'));
    });
    //controller.set('model',this.data);
    this.set('breadCrumb',{title:params.wikiName,record:true});
    controller.set('project',this.project);
  },

  /**
    This function retrieves the route parameters, Most of the wiki functionality
    is simialar so we one write it once and extends it for different routes.
    In order to make sure that we are able to retreive the correct paramerts we
    have exposed this function.
    @method getParams
    @returns params {Object} The parameters for this route
    @private
  */
  getParams:function(){
    var params = {};
    params['projectId'] = this.paramsFor('app.project').projectId;
    params['wikiName'] = this.paramsFor('app.project.wiki.page').wikiName;
    return params;
  }

});
