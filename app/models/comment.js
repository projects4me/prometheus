/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The comment model

  @class CommentModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
    The date on which the comment was created

    @property dateCreated
    @type String
    @for CommentModel
    @private
  */
  dateCreated: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

  /**
    The date on which the comment was last modified

    @property dateModified
    @type String
    @for CommentModel
    @private
  */
  dateModified: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

  /**
    The soft deletion flag of the comment

    @property deleted
    @type String
    @for CommentModel
    @private
  */
  deleted: DS.attr('string'),

  /**
    The comment

    @property comment
    @type String
    @for CommentModel
    @private
  */
  comment: DS.attr('string'),

  /**
    The identifier of the user who created the comment

    @property createdUser
    @type String
    @for CommentModel
    @private
  */
  createdUser: DS.attr('string'),

  /**
    The name of the user who created the comment

    @property createdUserName
    @type String
    @for CommentModel
    @private
  */
  createdUserName: DS.attr('string'),

  /**
    The identifier of the user who last modified the comment

    @property modifiedUser
    @type String
    @for CommentModel
    @private
  */
  modifiedUser: DS.attr('string'),

  /**
    The name of the user who last modified the comment

    @property modifiedUserName
    @type String
    @for CommentModel
    @private
  */
  modifiedUserName: DS.attr('string'),

  /**
    The entity the comment is related to

    @property relatedTo
    @type String
    @for CommentModel
    @private
  */
  relatedTo: DS.attr('string'),

  /**
    The identifier of the record the comment is related to

    @property relatedId
    @type String
    @for CommentModel
    @private
  */
  relatedId: DS.attr('string'),

  /**
    The user who created the comment

    @property createdby
    @type Relationship
    @for CommentModel
    @private
  */
  createdby: DS.belongsTo('user'),

  /**
    The conversation room the comment is associated with

    @property conversationroom
    @type Relationship
    @for CommentModel
    @private
  */
  conversationroom: DS.belongsTo('conversationroom')

});
