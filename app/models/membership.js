/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The membership model

  @class MembershipModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   The identifier of the project for which this membership rule is defined

   @property projectId
   @type String
   @for MembershipModel
   @private
  */
  projectId: DS.attr('string'),

  /**
   The identifier of the for whom this membership rule is defined

   @property userId
   @type String
   @for MembershipModel
   @private
  */
  userId: DS.attr('string'),

  /**
   The identifier of the role which is assigned to the user under the projectId
   that this rule is defined for

   @property roleId
   @type String
   @for MembershipModel
   @private
  */
  roleId: DS.attr('string'),

  /**
   The soft deletion flag for the membership

   @property deleted
   @type String
   @for MembershipModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   The date on which this membership rule was created

   @property dateCreated
   @type String
   @for MembershipModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   The date on which this membership rule was last modified

   @property dateModified
   @type String
   @for MembershipModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   The identifier of the user who created the membership rule

   @property createdUser
   @type String
   @for MembershipModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The identifier of the user who last modified the memberhsip rule

   @property modifiedUser
   @type String
   @for MembershipModel
   @private
  */
  modifiedUser: DS.attr('string'),

  // Add the relationships here
});
