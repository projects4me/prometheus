import Ember from "ember";
/**
 * This object is used to modify the default TextFeild of emberjs in order to
 * allow run time binding of fields based on metadata. By default emberjs
 * does not allow valueBinding with dynamic field names.
 *
 * This code is a slightly modifed version of code implemented by Jason Porritt
 * which can be found here
 * https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 * Thank you Jason for sharing :), I have been at this problem for some time now.
 */
export default Ember.TextField.extend({

});
