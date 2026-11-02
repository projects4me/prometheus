/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflownode model, one step of a workflow graph
 *
 * @class Workflownode
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflownodeModel extends Model {

    /**
     * @property workflowId
     * @for Workflownode
     * @public
     */
    @attr('string') workflowId;

    /**
     * trigger, condition, actor or action
     *
     * @property category
     * @for Workflownode
     * @public
     */
    @attr('string') category;

    /**
     * The kind within the category, such as issue.assignee.changed, filter or run_agent
     *
     * @property kind
     * @for Workflownode
     * @public
     */
    @attr('string') kind;

    /**
     * The settings of the kind, as JSON text
     *
     * @property config
     * @for Workflownode
     * @public
     */
    @attr('string') config;

    /**
     * @property name
     * @for Workflownode
     * @public
     */
    @attr('string') name;

    /**
     * @property positionX
     * @for Workflownode
     * @public
     */
    @attr('number') positionX;

    /**
     * @property positionY
     * @for Workflownode
     * @public
     */
    @attr('number') positionY;
}
