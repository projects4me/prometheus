/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from "@ember-data/model";

/**
 * The workflow rule model
 *
 * @class WorkflowRule
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module WorkflowRule
 */
export default Model.extend({
    /**
     * The identifier of the workflow definition this rule belongs to
     *
     * @property workflowDefinitionId
     * @type String
     * @for WorkflowRule
     * @private
     */
    workflowDefinitionId: attr("string"),

    /**
     * The identifier of the node this rule is associated with
     *
     * @property nodeId
     * @type String
     * @for WorkflowRule
     * @private
     */
    nodeId: attr("string"),

    /**
     * Type of the workflow rule
     *
     * @property ruleType
     * @type String
     * @for WorkflowRule
     * @private
     */
    ruleType: attr("string"),

    /**
     * Name of the workflow rule
     *
     * @property name
     * @type String
     * @for WorkflowRule
     * @private
     */
    name: attr("string"),

    /**
     * Description of the workflow rule
     *
     * @property description
     * @type String
     * @for WorkflowRule
     * @private
     */
    description: attr("string"),

    /**
     * JSON field for rule conditions
     *
     * @property conditions
     * @type String
     * @for WorkflowRule
     * @private
     */
    conditions: attr("string"),

    /**
     * JSON field for rule actions
     *
     * @property actions
     * @type String
     * @for WorkflowRule
     * @private
     */
    actions: attr("string"),

    /**
     * Priority of the workflow rule
     *
     * @property priority
     * @type Number
     * @for WorkflowRule
     * @private
     */
    priority: attr("number", { defaultValue: 0 }),

    /**
     * Whether the workflow rule is active
     *
     * @property isActive
     * @type Boolean
     * @for WorkflowRule
     * @private
     */
    isActive: attr("boolean", { defaultValue: true }),

    /**
     * Date on which the workflow rule was created
     *
     * @property dateCreated
     * @type String
     * @for WorkflowRule
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the workflow rule was last modified
     *
     * @property dateModified
     * @type String
     * @for WorkflowRule
     * @private
     */
    dateModified: attr("string"),

    /**
     * The workflow definition this rule belongs to
     *
     * @property workflowDefinition
     * @type WorkflowDefinitionModel
     * @for WorkflowRule
     * @private
     */
    workflowDefinition: belongsTo("workflow-definition"),

    /**
     * The workflow node this rule is associated with
     *
     * @property workflowNode
     * @type WorkflowNodeModel
     * @for WorkflowRule
     * @private
     */
    workflowNode: belongsTo("workflow-node")
}); 