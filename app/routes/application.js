/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

/**
  This is the application route, in EmberJs the application route is the main
  route, this is executed no matter what. We have to use this

  @class ApplicationRoute
  @extends Ember.Route
  @uses ApplicationRouteMixin
  @author Hammad Hassan gollmer@gmail.com
*/
export default Ember.Route.extend(ApplicationRouteMixin,{

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for ApplicationRoute
   @public
  */
  i18n: Ember.inject.service(),

  /**
    The session service which is offered by ember-simple-auth that will be used
    in order to verfy whether the used is authenticated

    @property session
    @type Object
    @for ApplicationRoute
    @public
  */
  session: Ember.inject.service('session'),

  /**
    This function get triggered before a model fetch is called, this is
    called every time and we routing the user to the signin route if a user
    is not authenticated

    @method afterModel
    @private
  */
  beforeModel:function(){
    this._super(...arguments);
    if(!this.get('session.isAuthenticated'))
    {
      this.transitionTo('signin');
    }
  },

  /**
    This function get triggered right after a model fetch is called, this is
    called every time and we are setting up the default language in the i18n
    service

    @method afterModel
    @private
  */
  afterModel: function() {
    Logger.debug('ApplicationRoute::afterModel() -- setting the language to '+lang);

    var lang = 'en';
    this.set('i18n.locale',lang);
    this.get('session').set('data.locale', lang);
  },

  /**
    These are the actions that this route supports

    @property actions
    @type Object
    @for ApplicationRoute
    @public
  */
  actions: {

    /**
      This function is used to display the modal

      Inspiration from http://ember.guru/2014/master-your-modals-in-ember-js

      @method showModal
      @param name {String} The name of the modal that needs to be displayed
      @param model {Object} The model object
      @private
    */
    showModal: function(name, controller, model) {
      this.render(name, {
        into: 'application',
        outlet: 'modal',
        controller: 'modals.'+controller,
        model: model
      });
    },

    /**
      This function is used to dispaly the modal

      Inspiration from http://ember.guru/2014/master-your-modals-in-ember-js

      @method removeModal
      @private
    */
    removeModal: function() {
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    }
  }

});
