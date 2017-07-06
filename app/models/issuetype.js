/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The issuetype model

  @class IssuetypeModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Name of the issue type

   @property name
   @type String
   @for IssuetypeModel
   @private
  */
  name: DS.attr('string'),

  /**
   Date on which the issue type was created

   @property dateCreated
   @type String
   @for IssuetypeModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   Date on which the issue type was last modified

   @property dateModified
   @type String
   @for IssuetypeModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   Soft deletion flag

   @property deleted
   @type String
   @for IssuetypeModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   Description of the issue type

   @property description
   @type String
   @for IssuetypeModel
   @private
  */
  description: DS.attr('string'),

  /**
   Identifier of the create who created the issue type

   @property createdUser
   @type String
   @for IssuetypeModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The identifier of the user who last modified the issue type

   @property modifiedUser
   @type String
   @for IssuetypeModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   The identifier of the project the issue type belongs to

   @property projectId
   @type String
   @for IssuetypeModel
   @private
  */
  projectId: DS.attr('string'),

  /**
   The system flag, the issue types with system flag cannot be deleted and are
   inherited by the projects by default

   @property system
   @type String
   @for IssuetypeModel
   @private
  */
  system: DS.attr('string'),

});
