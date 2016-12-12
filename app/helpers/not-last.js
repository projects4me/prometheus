/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';


/**
  This is a helper function that is used to format the dates for Handlebars

  @method notLast
  @param array {Object} The object that contains the data
  @param index {String} The curent index which needs evaluation
  @return isNotLast {Boolean} true if the index is not the last in the array and vice versa
  @private
*/
export function notLast(params) {
  var array = params[0];
  var index = params[1];

  var lastElement = array[Object.keys(array)[Object.keys(array).length - 1]];

  return (lastElement) !== (index);
}

/**
  The object that provides the notLast helper function

  @class NotLastHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(notLast);
