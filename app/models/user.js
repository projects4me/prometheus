/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The user model

  @class UserModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({
  /**
   Username

   @property username
   @type String
   @for UserModel
   @private
  */
  username: DS.attr('string'),

  /**
   Email Address

   @property email
   @type String
   @for UserModel
   @private
  */
  email: DS.attr('string'),

  /**
   Status

   @property status
   @type String
   @for UserModel
   @private
  */
  status: DS.attr('string'),

  /**
   name

   @property name
   @type String
   @for UserModel
   @private
  */
  name: DS.attr('string'),

  /**
   Date on which the user was created

   @property dateCreated
   @type String
   @for UserModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   Date on which the user was last modified

   @property dateModified
   @type String
   @for UserModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   Soft deletion flag

   @property deleted
   @type String
   @for UserModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   Description

   @property description
   @type String
   @for UserModel
   @private
  */
  description: DS.attr('string'),

  /**
   User who created this user

   @property createdUser
   @type String
   @for UserModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   User who modified this user

   @property modifiedUser
   @type String
   @for UserModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   Title of the user

   @property title
   @type String
   @for UserModel
   @private
  */
  title: DS.attr('string'),

  /**
   Phone number of the user

   @property phone
   @type String
   @for UserModel
   @private
  */
  phone: DS.attr('string')
});
