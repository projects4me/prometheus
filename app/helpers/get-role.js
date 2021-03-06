/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to retrieve the role name from the
 * membership and roles list.
 *
 * Please note that this function does not filter for the projectId. You must
 * pass the pre-filtered list.
 *
 * @method getRole
 * @param {String} userId The id of the user for whom we are trying to retrive the role name
 * @param {RoleMode} roles The roles for a project
 * @param {MembershipModel} memberhsip The membership rule list for a project
 * @return {String} roleName The role name
 * @private
 */
export function getRole(params) {
    return params[1].filterBy('id',params[2].filterBy('userId',params[0])[0].get('roleId'))[0].get('name');
}

/**
 * The object that provides the getRole helper function
 *
 * @class GetRole
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(getRole);
