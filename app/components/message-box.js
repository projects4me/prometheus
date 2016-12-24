import Ember from "ember";

/**
  This component is used to render the quill editor in the application in order
  to composer messages for the conversations

  @class MessageBoxComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  comment: null,

  classNames: ["message-box"],

  /**
    Load the message box after it has been loaded

    @todo perhaps delegate the did render per type
  */
  didRender: function() {
    //var self = this;
    Ember.$('#'+this.elementId +' .editable')
      .atwho({
        at: "@",
        data: ['Hammad', 'Mahnoor']
      });
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('#'+this.elementId +' .editable').atwho('destroy');
  },

  actions:{
    saveComment:function(id){
      this.sendAction('save',id,this.get('comment'));
    },
    
    commentChanged:function(event){
      Logger.debug(event);
    }
  }
});
