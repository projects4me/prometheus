/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  This component is used used for the control the bootstrap modal

  @class BootstrapModalComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
    Show the modal

    @method show
    @private
  */
  show: function() {
    this.$('.modal').modal().on('hidden.bs.modal', function() {
      this.sendAction('close');
    }.bind(this));
  }.on('didRender'),

  /**
    These are the actions supported by this components

    @property actions
    @type Object
    @for BootstrapModalComponent
    @public
  */
  actions: {

    /**
      This action is captures the confirm button and send it forward to be
      handled by the controller

      @method confirm
      @public
    */
    confirm: function() {
      this.$('.modal').modal('hide');
      this.sendAction('confirm');
    }
  },

});
