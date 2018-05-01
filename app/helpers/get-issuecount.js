/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to retrieve the count of issues in a
 * particular status
 *
 * @method getIssuecount
 * @param {IssueModel} issues The list of all the issues on the project
 * @param {String} type The type of status we are looking for
 * @return {Integer} count The count of the particular type of issues
 * @private
 */
export function getIssuecount(params) {
    let count = 0;
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
 * The object that provides the getIssuecount helper function
 *
 * @class GetIssuecount
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(getIssuecount);
