/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from "@ember-data/model";

/**
 * The workflow definition model
 *
 * @class WorkflowDefinition
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module WorkflowDefinition
 */
export default Model.extend({
    /**
     * Name of the workflow definition
     *
     * @property name
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    name: attr("string"),

    /**
     * Description of the workflow definition
     *
     * @property description
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    description: attr("string"),

    /**
     * Version of the workflow definition
     *
     * @property version
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    version: attr("string", { defaultValue: "1.0" }),

    /**
     * The identifier of the project this workflow definition belongs to
     *
     * @property projectId
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    projectId: attr("string"),

    /**
     * Whether the workflow definition is active
     *
     * @property isActive
     * @type Boolean
     * @for WorkflowDefinition
     * @private
     */
    isActive: attr("boolean", { defaultValue: true }),

    /**
     * Whether the workflow definition is a system workflow
     *
     * @property isSystem
     * @type Boolean
     * @for WorkflowDefinition
     * @private
     */
    isSystem: attr("boolean", { defaultValue: false }),

    /**
     * BPMN diagram XML content
     *
     * @property bpmnXml
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    bpmnXml: attr("string"),

    /**
     * Date on which the workflow definition was created
     *
     * @property dateCreated
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the workflow definition was last modified
     *
     * @property dateModified
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    dateModified: attr("string"),

    /**
     * Identifier of the user who created the workflow definition
     *
     * @property createdUser
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    createdUser: attr("string"),

    /**
     * Identifier of the user who last modified the workflow definition
     *
     * @property modifiedUser
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    modifiedUser: attr("string"),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for WorkflowDefinition
     * @private
     */
    deleted: attr("string"),

    /**
     * The project which this workflow definition belongs to
     *
     * @property project
     * @type ProjectModel
     * @for WorkflowDefinition
     * @private
     */
    project: belongsTo("project"),

    /**
     * The user who created this workflow definition
     *
     * @property createdBy
     * @type UserModel
     * @for WorkflowDefinition
     * @private
     */
    createdBy: belongsTo("user", { inverse: null }),

    /**
     * The user who last modified this workflow definition
     *
     * @property modifiedBy
     * @type UserModel
     * @for WorkflowDefinition
     * @private
     */
    modifiedBy: belongsTo("user", { inverse: null }),

    /**
     * The workflow nodes in this workflow definition
     *
     * @property workflowNodes
     * @type WorkflowNodeModel
     * @for WorkflowDefinition
     * @private
     */
    workflowNodes: hasMany("workflow-node"),

    /**
     * The workflow transitions in this workflow definition
     *
     * @property workflowTransitions
     * @type WorkflowTransitionModel
     * @for WorkflowDefinition
     * @private
     */
    workflowTransitions: hasMany("workflow-transition"),

    /**
     * The workflow instances based on this workflow definition
     *
     * @property workflowInstances
     * @type WorkflowInstanceModel
     * @for WorkflowDefinition
     * @private
     */
    workflowInstances: hasMany("workflow-instance"),

    /**
     * The workflow rules in this workflow definition
     *
     * @property workflowRules
     * @type WorkflowRuleModel
     * @for WorkflowDefinition
     * @private
     */
    workflowRules: hasMany("workflow-rule")
}); 