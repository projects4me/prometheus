/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';

/**
  This method extracts the page number from the URL in _links property returned
  via the API

  @method getWiki
  @param wiki {WikiModel} The wiki object
  @param wikiList {Object} The list of wiki entries for this project
  @return parent {String} The name of the parent
  @todo Handle exception. If possible then make generic
*/
export function getWiki(params) {
  Logger.debug('getWikiHelper::getWiki');
  Logger.debug(params);
  return params[1].findBy('value',params[0].get('parentId')).label;
}

/**
  The object that provides the getWiki helper function

  @class GetWikiHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(getWiki);
