/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The conversation room model

  @class ConversationroomModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Subject of the conversation room

   @property subject
   @type String
   @for ConversationroomModel
   @private
  */
  subject: DS.attr('string'),

  /**
   Date on which the conversation room was created on

   @property dateCreated
   @type String
   @for ConversationroomModel
   @private
  */
  dateCreated: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

  /**
   Date on which the conversation room was last modified

   @property dateModified
   @type String
   @for ConversationroomModel
   @private
  */
  dateModified: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

  /**
   Soft deletion flag

   @property deleted
   @type String
   @for ConversationroomModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   Dection of the conversation room

   @property description
   @type String
   @for ConversationroomModel
   @private
  */
  description: DS.attr('string'),

  /**
   The identifier of the user who created the room

   @property createdUser
   @type String
   @for ConversationroomModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The name of the user who created the room

   @property createdUserName
   @type String
   @for ConversationroomModel
   @private
  */
  createdUserName: DS.attr('string'),

  /**
   The name of the user who last modified the room

   @property modifiedUserName
   @type String
   @for ConversationroomModel
   @private
  */
  modifiedUserName: DS.attr('string'),

  /**
   The identifier of the user who last modified the room

   @property subject
   @type String
   @for ConversationroomModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   Type of conversation room e.g. vote, discussion

   @property roomType
   @type String
   @for ConversationroomModel
   @private
  */
  roomType: DS.attr('string'),

  /**
   The identifier of the project that this room belongs to

   @property projectId
   @type String
   @for ConversationroomModel
   @private
  */
  projectId: DS.attr('string'),

  /**
   The user who created the room

   @property createdBy
   @type UserModel
   @for ConversationroomModel
   @private
  */
  createdBy:DS.belongsTo('user'),

  /**
   The user who modified the room

   @property modifiedBy
   @type UserModel
   @for ConversationroomModel
   @private
  */
  modifiedBy:DS.belongsTo('user'),

  /**
   The project this room belongs to

   @property project
   @type Relationship
   @for ConversationroomModel
   @private
  */
  project:DS.belongsTo('project'),

  /**
   Comments made on this conversation room

   @property comments
   @type Relationship
   @for ConversationroomModel
   @private
  */
  comments: DS.hasMany('comment'),

  /**
   Votes made on this conversation room

   @property votes
   @type VoteModel
   @for ConversationroomModel
   @private
  */
  votes: DS.hasMany('vote')
});
