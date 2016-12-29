/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The role model

  @class RoleModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Name of the role

   @property name
   @type String
   @for RoleModel
   @private
  */
  name: DS.attr('string'),

  /**
   The date on which the role was created

   @property dateCreated
   @type String
   @for RoleModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   The date on which the role was last modified

   @property dateModified
   @type String
   @for RoleModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   The soft deletion flag of the role

   @property deleted
   @type String
   @for RoleModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   The description of the role

   @property description
   @type String
   @for RoleModel
   @private
  */
  description: DS.attr('string'),

  /**
   The identifier of the user who created the role

   @property createdUser
   @type String
   @for RoleModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The identifier of the user who last modified the role

   @property modifiedUser
   @type String
   @for RoleModel
   @private
  */
  modifiedUser: DS.attr('string'),

  // Add the relationships here
});
