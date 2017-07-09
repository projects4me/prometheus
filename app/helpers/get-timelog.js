/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';
import _ from "lodash";

/**
 * This is a helper function that is used to retrieve the sum of time log entries
 * or a particular type
 *
 * @method getTimelog
 * @param {IssueModel} issues The list of all the issues on the project
 * @param {String} type The type of time log required
 * @return {Integer} totaltime The sum on the time logged for the type
 * @private
 */
export function getTimelog(params) {
    var sum = 0;

    if (params[0] !== undefined)
    {
        var issueCount = params[0].get('length');
        for (var i=0;i<issueCount;i++){
            var issue = params[0].nextObject(i);
            if (issue !== undefined)
            {
                var timelog = issue.get(params[1]);
                if (timelog !== undefined)
                {
                    sum += _.sum(timelog.getEach('days').map(Number)) * 24;
                    sum += _.sum(timelog.getEach('hours').map(Number));
                    sum += _.sum(timelog.getEach('hours').map(Number)) / 60;
                }
            }
        }
    }
    return _.round(sum);
}

/**
 * The object that provides the getTimelog helper function
 *
 * @class GetTimelog
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Helper.helper(getTimelog);
