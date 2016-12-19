/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The wiki model

  @class WikiModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Name of the wiki page

   @property name
   @type String
   @for WikiModel
   @private
  */
  name: DS.attr('string'),

  /**
   Date on which the wiki page was created

   @property dateCreated
   @type String
   @for WikiModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   Date on which the wiki page was last modified

   @property name
   @type String
   @for WikiModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   The identifier of the user who created the wiki page

   @property createdUser
   @type String
   @for WikiModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The name of the use who created the wiki page

   @property createdUserName
   @type String
   @for WikiModel
   @private
  */
  createdUserName: DS.attr('string'),

  /**
   The identifier of the user who last modified the wiki page

   @property modifiedUser
   @type String
   @for WikiModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   The name of the user who last modified the wiki page

   @property modifiedUserName
   @type String
   @for WikiModel
   @private
  */
  modifiedUserName: DS.attr('string'),

  /**
   The soft deletion flag of the wiki page

   @property deleted
   @type String
   @for WikiModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   The status of the wiki page

   @property status
   @type String
   @for WikiModel
   @private
  */
  status: DS.attr('string'),

  /**
   The lock flag of the wiki page

   @property locked
   @type String
   @for WikiModel
   @private
  */
  locked: DS.attr('string'),

  /**
   The upvotes given to the project

   @property upvotes
   @type String
   @for WikiModel
   @private
  */
  upvotes: DS.attr('string'),

  /**
   The identifier of the project that the wiki page is linked to

   @property projectId
   @type String
   @for WikiModel
   @private
  */
  projectId: DS.attr('string'),

  /**
   The mark up of the wiki page

   @property markUp
   @type String
   @for WikiModel
   @private
  */
  markUp: DS.attr('string'),

  /**
   The identifier of the parent wiki page

   @property parentId
   @type String
   @for WikiModel
   @private
  */
  parentId: DS.attr('string'),

  /**
   Comments made on this conversation room

   @property tags
   @type Relationship
   @for ConversationroomModel
   @private
  */
  tagged: DS.hasMany('tagged')
});
