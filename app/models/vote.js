/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The vote model

  @class VoteModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Date on which the vote was created

   @property dateCreated
   @type String
   @for VoteModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   Date on which the vote was last modified

   @property dateModified
   @type String
   @for VoteModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   The identifier of the user who created the vote

   @property createdUser
   @type String
   @for VoteModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The name of the use who created the vote

   @property createdUserName
   @type String
   @for VoteModel
   @private
  */
  createdUserName: DS.attr('string'),

  /**
   The identifier of the user who last modified the vote

   @property modifiedUser
   @type String
   @for VoteModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   The name of the user who last modified the vote

   @property modifiedUserName
   @type String
   @for VoteModel
   @private
  */
  modifiedUserName: DS.attr('string'),

  /**
   The vote flag

   @property deleted
   @type String
   @for VoteModel
   @private
  */
  vote: DS.attr('string'),

  /**
   The identifier of the record this vote is related to

   @property relatedId
   @type String
   @for VoteModel
   @private
  */
  relatedId: DS.attr('string'),

  /**
   The model this vote is related to

   @property relatedTo
   @type String
   @for VoteModel
   @private
  */
  relatedTo: DS.attr('string'),

});
