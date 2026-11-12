/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import { helper } from '@ember/component/helper';
import { get } from '@ember/object';
import { toArray } from 'prometheus/utils/array/to-array';

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
    let sum = 0;

    toArray(params[0]).forEach((issue) => {
        let timelog = issue ? toArray(get(issue, params[1])) : [];
        sum += _.sum(timelog.map((item) => item.days).map(Number)) * 24;
        sum += _.sum(timelog.map((item) => item.hours).map(Number));
        sum += _.sum(timelog.map((item) => item.hours).map(Number)) / 60;
    });
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
export default helper(getTimelog);
