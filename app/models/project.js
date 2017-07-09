/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The project model
 *
 * @class Project
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * Name of project
     *
     * @property name
     * @type String
     * @for Project
     * @private
     */
    name: DS.attr('string'),

    /**
     * Short Code of project
     *
     * @property shortCode
     * @type String
     * @for Project
     * @private
     */
    shortCode: DS.attr('string'),

    /**
     * Date on which the project was created
     *
     * @property dateCreated
     * @type String
     * @for Project
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the project was last modified
     *
     * @property dateModified
     * @type String
     * @for Project
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The start date of the project
     *
     * @property startDate
     * @type String
     * @for Project
     * @private
     */
    startDate: DS.attr('string'),

    /**
     * The end date of the project
     *
     * @property endDate
     * @type String
     * @for Project
     * @private
     */
    endDate: DS.attr('string'),

    /**
     * Type of the project
     *
     * @property type
     * @type String
     * @for Project
     * @private
     */
    type: DS.attr('string'),

    /**
     * User who last modified the project
     *
     * @property modifiedUser
     * @type String
     * @for Project
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The project owner ot assignee
     *
     * @property assignee
     * @type String
     * @for Project
     * @private
     */
    assignee: DS.attr('string'),

    /**
     * Soft deletion flag of the project
     *
     * @property deleted
     * @type String
     * @for Project
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * Description of the project
     *
     * @property description
     * @type String
     * @for Project
     * @private
     */
    description: DS.attr('string'),

    /**
     * Status of the project
     *
     * @property status
     * @type String
     * @for Project
     * @private
     */
    status: DS.attr('string'),

    /**
     * Scope of the project
     *
     * @property scope
     * @type String
     * @for Project
     * @private
     */
    scope: DS.attr('string'),

    /**
     * Product Vision
     *
     * @property vision
     * @type String
     * @for Project
     * @private
     */
    vision: DS.attr('string'),

    /**
     * User who created the project
     *
     * @property createdUser
     * @type String
     * @for Project
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The estimated budget of the project
     *
     * @property estimatedBudget
     * @type String
     * @for Project
     * @private
     */
    estimatedBudget: DS.attr('string'),

    /**
     * The amount of budget spent on the project
     *
     * @property spentBudget
     * @type String
     * @for Project
     * @private
     */
    spentBudget: DS.attr('string'),

    /**
     * Project owner
     *
     * @property owner
     * @type Relationship
     * @for Project
     * @private
     */
    owner:DS.belongsTo('user'),

    /**
     * User who created the project
     *
     * @property createdBy
     * @type Relationship
     * @for Project
     * @private
     */
    createdBy:DS.belongsTo('user'),

    /**
     * User who modified the project
     *
     * @property modifiedBy
     * @type Relationship
     * @for Project
     * @private
     */
    modifiedBy:DS.belongsTo('user'),

    /**
     * The members of this project
     *
     * @property members
     * @type UserModel
     * @for Project
     * @private
     */
    members:DS.hasMany('user'),

    /**
     * The conversations that are happening on this project
     *
     * @property conversations
     * @type Relationship
     * @for Project
     * @private
     */
    conversations:DS.hasMany('conversationroom'),

    /**
     * These are the issues that are related to the project, since the number of
     * issues related to a project can grow significantly it is advisable that they
     * are not retrieve via the same query as the other project information
     *
     * @property issues
     * @type Relationship
     * @for Project
     * @private
     */
    issues:DS.hasMany('issue'),

    /**
     * The roles related to the members of this project, please note that these
     * roles are not related to the users directly. The API simply returns all
     * the roles as well as the membership rules. The application has to relate the
     * user to the role via the code.
     *
     * @property roles
     * @type Relationship
     * @for Project
     * @private
     */
    roles:DS.hasMany('role'),

    /**
     * The membership rules for this project.
     *
     * @property memberships
     * @type Relationship
     * @for Project
     * @private
     */
    memberships:DS.hasMany('membership'),

});