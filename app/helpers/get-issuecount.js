/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';

/**
  This is a helper function that is used to retrieve the count of issues in a
  particular status

  @method getIssuecount
  @param issues {IssueModel} The list of all the issues on the project
  @param type {String} The type of status we are looking for
  @return count {Integer} The count of the particular type of issues
  @private
*/
export function getIssuecount(params) {
  var count = 0;
  if (params[0] !== undefined)
  {
    if (params[1] === 'open')
    {
      count += params[0].filterBy('status','new').length;
      count += params[0].filterBy('status','in_progress').length;
      count += params[0].filterBy('status','pending').length;
      count += params[0].filterBy('status','feedback').length;
    }
    else if (params[1] === 'closed')
    {
      count += params[0].filterBy('status','done').length;
      count += params[0].filterBy('status','complete').length;
      count += params[0].filterBy('status','closed').length;
      count += params[0].filterBy('status','deferred').length;
    }
  }
  return count;
}

/**
  The object that provides the getIssuecount helper function

  @class GetIssuecountHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(getIssuecount);
