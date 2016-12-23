/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The tagged model. This model is used to maint the relationship between tags
  and the related entities.

  @class TaggedModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   The identifier of the entity the tag is related to

   @property relatedId
   @type String
   @for TaggedModel
   @private
  */
  "relatedId": DS.attr('string'),

  /**
   The entity the tag is related to

   @property relatedTo
   @type String
   @for TaggedModel
   @private
  */
  "relatedTo": DS.attr('string'),

  /**
   The identifier of the tag

   @property tagId
   @type String
   @for TaggedModel
   @private
  */
  "tagId": DS.attr('string')
  
});
