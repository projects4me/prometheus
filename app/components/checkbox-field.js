import Ember from "ember";

/**
 This object is used to modify the default TextFeild of emberjs in order to
 allow run time binding of fields based on metadata. By default emberjs
 does not allow valueBinding with dynamic field names.
 This code is a slightly modifed version of code implemented by Jason Porritt
 which can be found here
 https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 Thank you Jason for sharing :), I have been at this problem for some time now.

 @class checkbox-field
 @module app
 @submodule Component
 @namespace Prometheus
 @extends Ember.Checkbox
 */
export default Ember.Checkbox.extend({

  /**
    Adding paramater binding for data-select so that it is disabled on the view and then used to identify selected items

    @property attributeBindings
    @type Array
    @for checkbox-field
    @private
  */
  attributeBindings: ['data-select'],

  /**
    Setup a listerer on field change on initialization

    @method onInit
    @private
  */
  onInit: function(){
    var action = this.get('action');
    if(action){
      this.on('change', this, this.changeEvent);
    }
  }.on('init'),

  /**
    Forward the action to the field-view controller to handle

    @method changeEvent
    @public
  */
  changeEvent: function(){
     this.sendAction('action',  this.$().prop('checked'));
  },

  /**
   Cleanup the event registered up destruction of the view to avoid memory leaks

   @method cleanup
   @public
  */
  cleanup: function(){
    this.off('change', this, this.changeEvent);
  }.on('willDestroyElement')
});
