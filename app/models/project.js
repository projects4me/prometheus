/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import DS from "ember-data";

/**
  The project model

  @class ProjectModel
  @extends DS.Model
  @author Hammad Hassan gollmer@gmail.com
*/
export default DS.Model.extend({

  /**
   Name of project

   @property name
   @type String
   @for ProjectModel
   @private
  */
  name: DS.attr('string'),


  /**
   Short Code of project

   @property shortCode
   @type String
   @for ProjectModel
   @private
  */
  shortCode: DS.attr('string'),


  /**
   Date on which the project was created

   @property dateCreated
   @type String
   @for ProjectModel
   @private
  */
  dateCreated: DS.attr('string'),


  /**
   Date on which the project was last modified

   @property dateModified
   @type String
   @for ProjectModel
   @private
  */
  dateModified: DS.attr('string'),


  /**
   The start date of the project

   @property startDate
   @type String
   @for ProjectModel
   @private
  */
  startDate: DS.attr('string'),


  /**
   The end date of the project

   @property endDate
   @type String
   @for ProjectModel
   @private
  */
  endDate: DS.attr('string'),


  /**
   Type of the project

   @property type
   @type String
   @for ProjectModel
   @private
  */
  type: DS.attr('string'),


  /**
   User who last modified the project

   @property modifiedUser
   @type String
   @for ProjectModel
   @private
  */
  modifiedUser: DS.attr('string'),


  /**
   The project owner ot assignee

   @property assignee
   @type String
   @for ProjectModel
   @private
  */
  assignee: DS.attr('string'),


  /**
   Soft delettion flag of the project

   @property deleted
   @type String
   @for ProjectModel
   @private
  */
  deleted: DS.attr('string'),


  /**
   Description of the project

   @property description
   @type String
   @for ProjectModel
   @private
  */
  description: DS.attr('string'),


  /**
   Status of the project

   @property status
   @type String
   @for ProjectModel
   @private
  */
  status: DS.attr('string'),


  /**
   Scope of th eproject

   @property scope
   @type String
   @for ProjectModel
   @private
  */
  scope: DS.attr('string'),


  /**
   Product Vision

   @property vision
   @type String
   @for ProjectModel
   @private
  */
  vision: DS.attr('string'),


  /**
    User who created the project

   @property createdUser
   @type String
   @for ProjectModel
   @private
  */
  createdUser: DS.attr('string'),


  /**
   Project owner

   @property owner
   @type Relationship
   @for ProjectModel
   @private
  */
  owner:DS.belongsTo('user'),


  /**
   User who created the project

   @property createdBy
   @type Relationship
   @for ProjectModel
   @private
  */
  createdBy:DS.belongsTo('user'),


  /**
   User who modified the project

   @property modifiedBy
   @type Relationship
   @for ProjectModel
   @private
  */
  modifiedBy:DS.belongsTo('user'),
});
