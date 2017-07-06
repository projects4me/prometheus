/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';

/**
  This is a helper function that is used to format the dates for Handlebars

  @method getDate
  @param data {Object} The object that contains the date
  @param index {String} The index on which the data is set
  @param format {String} Format of the date. Default MMMM Do YYYY, h:mm:ss a
  @return date {String} Formated date
  @private
*/
export function getDate(params) {
  var data = params[0];
  var index = params[1];
  var format = "MMMM Do YYYY, h:mm:ss a";
  if (params[2] !== undefined)
  {
    format = params[2];
  }

  if (data !== undefined)
  {
    return moment(data.get(index)).format(format);
  }
  return false;
}

/**
  The object that provides the getDate helper function

  @class GetDateHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(getDate);
