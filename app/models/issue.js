/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The issue model

  @class IssueModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Subject of the issue

   @property subject
   @type String
   @for IssueModel
   @private
  */
  subject: DS.attr('string'),

  /**
   Date on which the issue was created

   @property dateCreated
   @type String
   @for IssueModel
   @private
  */
  dateCreated: DS.attr('string'),

  /**
   Date on which the issue was last modified

   @property dateModified
   @type String
   @for IssueModel
   @private
  */
  dateModified: DS.attr('string'),

  /**
   Soft deletion flag

   @property deleted
   @type String
   @for IssueModel
   @private
  */
  deleted: DS.attr('string'),

  /**
   Description of the issue

   @property description
   @type String
   @for IssueModel
   @private
  */
  description: DS.attr('string'),

  /**
   Identifier of the create who created the issue

   @property createdUser
   @type String
   @for IssueModel
   @private
  */
  createdUser: DS.attr('string'),

  /**
   The identifier of the user who is designated as the owner of the issue

   @property owner
   @type String
   @for IssueModel
   @private
  */
  owner: DS.attr('string'),

  /**
   The identifier of the user who is currently the assignee of the issue

   @property assignee
   @type String
   @for IssueModel
   @private
  */
  assignee: DS.attr('string'),

  /**
   The identifier of the user who reported the issue

   @property reportedUser
   @type String
   @for IssueModel
   @private
  */
  reportedUser: DS.attr('string'),

  /**
   The identifier of the user who last modified the issue

   @property modifiedUser
   @type String
   @for IssueModel
   @private
  */
  modifiedUser: DS.attr('string'),

  /**
   The number of the issue

   @property issueNumber
   @type String
   @for IssueModel
   @private
  */
  issueNumber: DS.attr('string'),

  /**
   The end data set for the issue

   @property endDate
   @type String
   @for IssueModel
   @private
  */
  endDate: DS.attr('string'),

  /**
   The date on which the issue is set to start

   @property subject
   @type String
   @for IssueModel
   @private
  */
  startDate: DS.attr('string'),

  /**
   Status of the issue

   @property status
   @type String
   @for IssueModel
   @private
  */
  status: DS.attr('string'),

  /**
   Priority of the issue

   @property priority
   @type String
   @for IssueModel
   @private
  */
  priority: DS.attr('string'),

  /**
   The identifier of the project the issue belongs to

   @property projectId
   @type String
   @for IssueModel
   @private
  */
  projectId: DS.attr('string'),

  /**
   The identifier of the milestone this issue is set for

   @property milestoneId
   @type String
   @for IssueModel
   @private
  */
  milestoneId: DS.attr('string'),

  /**
   The identifier of the parent of the issue

   @property parentId
   @type String
   @for IssueModel
   @private
  */
  parentId: DS.attr('string'),

  /**
   The identifier of the type this issue belongs to

   @property typeId
   @type String
   @for IssueModel
   @private
  */
  typeId: DS.attr('string')
});
