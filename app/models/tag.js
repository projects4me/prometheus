/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The tagged room model

  @class TaggedModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   The tag

   @property tag
   @type String
   @for TaggedModel
   @private
  */
  "tag": DS.attr('string'),

  /**
   The date on which the tag was created

   @property dateCreated
   @type String
   @for TaggedModel
   @private
  */
  "dateCreated": DS.attr('string'),

  /**
   The date on which the tag was last mofidied

   @property dateModified
   @type String
   @for TaggedModel
   @private
  */
  "dateModified": DS.attr('string'),

  /**
   The soft deletion flag of the tag

   @property tag
   @type String
   @for TaggedModel
   @private
  */
  "deleted": DS.attr('string'),

  /**
   The identifier of the user who last created the tag

   @property createdUser
   @type String
   @for TaggedModel
   @private
  */
  "createdUser": DS.attr('string'),

  /**
   The name of the user who created the tag

   @property createdUserName
   @type String
   @for TaggedModel
   @private
  */
  "createdUserName": DS.attr('string'),

  /**
   The identifier of the user who last modified the tag

   @property modifiedUser
   @type String
   @for TaggedModel
   @private
  */
  "modifiedUser": DS.attr('string'),

  /**
   The name of the user who last modified the tag

   @property modifiedUserName
   @type String
   @for TaggedModel
   @private
  */
  "modifiedUserName": DS.attr('string'),
});
