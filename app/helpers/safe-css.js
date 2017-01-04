/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';


/**
  This is a helper function that is used to return safe CSS

  @method safeCss
  @param styleData {String} style data
  @return htmlSafe {String} SafeString
  @private
*/
export function safeCss(params) {
  //var color = escapeCSS(params[0]);
  return Ember.String.htmlSafe(params[0]);

}

/**
  The object that provides the safeCss helper function

  @class SafeCssHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(safeCss);
