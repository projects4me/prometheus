import Ember from "ember";

/**
 This object is used to modify the default TextFeild of emberjs in order to
 allow run time binding of fields based on metadata. By default emberjs
 does not allow valueBinding with dynamic field names.
 This code is a slightly modifed version of code implemented by Jason Porritt
 which can be found here
 https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 Thank you Jason for sharing :), I have been at this problem for some time now.
 @class textarea-field
 @module app
 @submodule Component
 @namespace Prometheus
 @extends Ember.Checkbox
 */
export default Ember.TextArea.extend({

  /**
    Adding paramater binding for data-identifier so that we can get the related id with it
    @property attributeBindings
    @type Array
    @for textarea-field
    @private
  */
  attributeBindings: ['data-related','data-identifier'],
});
