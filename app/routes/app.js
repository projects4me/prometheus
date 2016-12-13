/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

/**
  This is the app route, the app route is used

  @class AppRoute
  @extends Ember.Route
  @uses AuthenticatedRouteMixin
  @author Hammad Hassan gollmer@gmail.com
*/
export default Ember.Route.extend(AuthenticatedRouteMixin,{

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for Routes
   @public
  */
  i18n: Ember.inject.service(),

  /**
   The current user service

   @property currentUser
   @type Ember.Service
   @for Routes
   @public
  */
  currentUser: Ember.inject.service(),

  /**
    This function is called by EmberJs before it retrieves the model

    @method beforeModel
    @public
  */
  beforeModel() {
    return this.loadCurrentUser();
  },

  /**
    This function catchs any issue thrown by the _loadCurrentUser function and
    invalidates the session

    @method sessionAuthenticated
    @private
  */
  sessionAuthenticated() {
    this._super(...arguments);
    this.loadCurrentUser().catch(() => this.get('session').invalidate());
  },


  /**
    This function is used to retrieve the currentUser using the current user
    service

    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  loadCurrentUser() {
    return this.get('currentUser').loadUser();
  },

  /**
    The setup controller function that will be called every time the user visits
    the route, this function is responsible for loading the required data

    @method setupController
    @param controller {Object} the controller object for this route
    @private
  */
  setupController:function(controller){
    Logger.debug('AppRoute::setupController');


    // If the user navigated directly to the wiki project or page then lets setup the project id
    var projectId = this.paramsFor('app.project').projectId;
    var projectName = null;

    var self = this;
    self.set('breadCrumb', {title: 'Dashboard'});

    Logger.debug(projectId);
    Logger.debug(projectName);

    var options = {
      fields: "Project.id,Project.name",
      query: "((Project.name STARTS A) OR (Project.name STARTS P))",
      rels : 'none',
      sort : 'Project.name',
      order: 'ASC',
      limit: 200
    };

    Logger.debug('Retreiving projects list with options '+options);
    this.data = this.store.query('project',options).then(function(data){
      var projectCount = data.get('length');
      var projectList = [];
      var temp = null;
      for (var i=0;i<projectCount;i++)
      {
        temp = data.nextObject(i);
        projectList[i] = {label:temp.get('name'), value:temp.get('id')};
      }
      controller.set('projectList',projectList);

      // if it was a sub route then setup the projectName and id
      if (projectId !== null && projectId !== undefined)
      {
        projectName = data.findBy('id',projectId).get('name');
        controller.set('projectId',projectId);
        controller.set('projectName',projectName);
      }

    });

  }
});
