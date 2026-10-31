/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflowedge model, a connection from an output port of one workflow node to another node
 *
 * @class Workflowedge
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflowedgeModel extends Model {

    /**
     * @property workflowId
     * @for Workflowedge
     * @public
     */
    @attr('string') workflowId;

    /**
     * @property fromNodeId
     * @for Workflowedge
     * @public
     */
    @attr('string') fromNodeId;

    /**
     * The output port of the from node, such as next, pass or a switch case
     *
     * @property fromPort
     * @for Workflowedge
     * @public
     */
    @attr('string') fromPort;

    /**
     * @property toNodeId
     * @for Workflowedge
     * @public
     */
    @attr('string') toNodeId;
}
