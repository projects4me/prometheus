/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from 'ember';

/**
  This is a helper function that is used to retrieve the role name from the
  memberhsip and roles list.

  Please note that this function does not filter for the projectId. You must
  pass the pre-filtered list.

  @method getRole
  @param userId {String} The id of the user for whom we are trying to retrive the role name
  @param roles {RoleModel} The roles for a project
  @param memberhsip {MembershipModel} The memberhsip rule list for a project
  @return roleName {String} The role name
  @private
*/
export function getRole(params) {
  return params[1].filterBy('id',params[2].filterBy('userId',params[0])[0].get('roleId'))[0].get('name');
}

/**
  The object that provides the getRole helper function

  @class GetRoleHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(getRole);
