/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

const { inject: { service } } = Ember;

/**
  This controller is used to add a tag

  @class AddTagController
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Controller.extend({

  /**
    The store is injected as a service

    @property store
    @type Service
    @for CurrentUserService
    @private
  */
  store: service(),

  /**
    These are the actions supported by this controller

    @property actions
    @type Object
    @for BootstrapModalComponent
    @public
  */
  actions: {

    /**
      This action is captures the confirm button

      @method confirm
      @public
    */
    save: function() {
      Logger.debug('AddTagController:save()');
      Logger.debug(this);
      this.get('model');

    }
  },

});
