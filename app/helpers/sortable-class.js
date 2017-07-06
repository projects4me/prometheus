/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';

/**
  This is the helper function that is used in the list views in order to get the
  class name for the sortable rows

  @method sortableClass
  @param fieldName {String} The field for which we need the class
  @param sort {String} The field on which the page is currently sorted
  @param order {String} The order of the sort
  @return className {String} The class for this field
  @private
*/
export function sortableClass(params) {
  var className="sortable";
  if (params[0] === params[1])
  {
    className += ' sortable-'+params[2];
  }
  return className;
}

/**
  The object that provides the sortableClass helper function

  @class SortableClassHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(sortableClass);
