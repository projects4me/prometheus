/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to extract user skills from a comma separated format
 * to array and return that array to template. 
 * @method getUserSkills
 * @param {String} skillsString Property that contains user skills
 * @param {String} type The type of time log required
 * @return {Integer} totaltime The sum on the time logged for the type
 * @private
 */
function getUserSkills([], { skillsString }) {
    if (skillsString) {
        return skillsString.split(',');
    }
}

/**
 * The object that provides the getUserSkills helper function
 *
 * @class GetUserSkills
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default helper(getUserSkills);
