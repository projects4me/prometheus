/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This helper is used to find if among the objects passed the user created any
 * object
 *
 * @method UserCreated
 * @param {ModelCollection} model A collection model object
 * @param {String} userId The identifier we are trying to filter on
 * @return {Boolean} created The flag which is true if userId is a createdUser of the model
 * @todo Handle exception. If possible then make generic
 */
export function userCreated(params) {
    return (params[0].filterBy('createdUser',params[1]).length >0 )?true:false;
}

/**
 * The object that provides the getWiki helper function
 *
 * @class UserCreated
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(userCreated);
