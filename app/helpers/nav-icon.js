/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';
import MD from "../utils/metadata/metadata";


/**
  This is a helper function that is used get the icon for the nav item

  @method objectEmpty
  @param array {Object} The object that contains the data
  @param index {String} The curent index which needs evaluation
  @return isNotLast {Boolean} true if the index is not the last in the array and vice versa
  @private
*/
export function navIcon(params) {
  var metaData = MD.create().getViewMeta('Navigation','items');
  var navModule = Ember.String.capitalize(params[0]);
  if (navModule === 'App'){
    navModule = 'Dashboard';
  }
  if (metaData[navModule] !== undefined)
  {
    return metaData[navModule].icon;
  }
  return '';
}

/**
  The object that provides the navIcon helper function

  @class NavIconHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(navIcon);
