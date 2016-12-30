import Ember from "ember";

/**
  This component is used to render the chat-boxes in the application

  @class ChatBoxComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for ChatBoxComponent
   @private
  */
  i18n: Ember.inject.service(),

  /**
    These are the classes the must be registered with the component

    @property classNames
    @type Array
    @for ChatBoxComponent
    @private
  */
  classNames: ["chat-boxes"],

  /**
    Flag that maintains whether the user is typing or not

    @property isUserTyping
    @type Bool
    @for ChatBoxComponent
    @private
  */
	isUserTyping: false,


  /**
    This function is called when the object is created, we are using this
    function to translate the emojis

    @method init
  */
  init:function(){
    this._super(...arguments);
  },
});
