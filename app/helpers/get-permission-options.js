/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import options from 'prometheus/config/acl/permission-options';

/**
 * This method returns the permission options of the requested module of the system.
 *
 * @method getPermissionOptions
 * @param {string} moduleName The name of the module e.g. API, frontend.
 * @returns {Object} List of options
 */
export default helper(function getPermissionOptions([moduleName]/*, named*/) {
  return options[moduleName];
});
