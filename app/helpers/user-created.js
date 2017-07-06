/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  This helper is used to find if among the objects passed the user created any
  object


  @method UserCreated
  @param model {ModelCollection} A collection model object
  @param userId {String} The identifier we are trying to filter on
  @return created {bool} The flag which is true if userId is a createdUser of the model
  @todo Handle exception. If possible then make generic
*/
export function userCreated(params) {
  return (params[0].filterBy('createdUser',params[1]).length >0 )?true:false;
}

/**
  The object that provides the getWiki helper function

  @class UserCreatedHelper
  @extends Ember.Helper.helper
  @author Hammad Hassan gollomer@gmail.com
*/
export default Ember.Helper.helper(userCreated);
