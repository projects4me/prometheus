/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The milestone model

  @class MilestoneModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
    The name of the milestone

    @property name
    @type String
    @for MilestoneModel
    @private
  */
  name: DS.attr('string'),

  /**
    The date on which the milestone was created

    @property dateCreated
    @type String
    @for MilestoneModel
    @private
  */
  dateCreated: DS.attr('string'),

  /**
    The date on which the milestone was created

    @property dateModified
    @type String
    @for MilestoneModel
    @private
  */
  dateModified: DS.attr('string'),

  /**
    The description of the milestone

    @property description
    @type String
    @for MilestoneModel
    @private
  */
  description: DS.attr('string'),

  /**
    The identifier of the user who created the milestone

    @property createdUser
    @type String
    @for MilestoneModel
    @private
  */
  createdUser: DS.attr('string'),

  /**
    The identifier of the user who laste modified the milestone

    @property modifiedUser
    @type String
    @for MilestoneModel
    @private
  */
  modifiedUser: DS.attr('string'),

  /**
    The type of the milestone

    @property type
    @type String
    @for MilestoneModel
    @private
  */
  milestoneType: DS.attr('string'),

  /**
    The status of the milestone

    @property milestone
    @type String
    @for MilestoneModel
    @private
  */
  status: DS.attr('string'),

  /**
    The start date set for the milestone

    @property startDate
    @type String
    @for MilestoneModel
    @private
  */
  startDate: DS.attr('string'),

  /**
    The end date set for the milestone

    @property endDate
    @type String
    @for MilestoneModel
    @private
  */
  endDate: DS.attr('string'),

  /**
    The identifier of the project to which this milestone belongs to

    @property projectId
    @type String
    @for MilestoneModel
    @private
  */
  projectId: DS.attr('string'),

  /**
    The soft deletion flag of the milestone

    @property deleted
    @type String
    @for MilestoneModel
    @private
  */
  deleted: DS.attr('string'),

  /**
    The project the milestone is related to

    @property project
    @type ProjectModel
    @for MilestoneModel
    @private
  */
  project : DS.belongsTo('project'),

  /**
    The issues that belongs to this milestone

    @property issues
    @type IssueModel
    @for MilestoneModel
    @private
  */
  issues : DS.hasMany('issue'),

});
