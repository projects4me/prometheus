/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { format } from 'prometheus/utils/date';

/**
 * This is a helper function that is used to change the date to humanized format using the date utility.
 *
 * @method getHumanizedDate
 * @param {Object} data The object that contains the date
 * @return {String} date Formatted date
 * @private
 */
export default helper(function getHumanizedDate(positional/*, named*/) {
    let date = format(positional[0], 'DD MMMM YYYY');
    return date;
});
