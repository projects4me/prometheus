/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflow model, an automation of triggers, conditions, actors and actions. Its graph is kept in the
 * workflownode and workflowedge models.
 *
 * @class Workflow
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflowModel extends Model {

    /**
     * @property name
     * @for Workflow
     * @public
     */
    @attr('string') name;

    /**
     * @property description
     * @for Workflow
     * @public
     */
    @attr('string') description;

    /**
     * Draft, Active or Disabled
     *
     * @property status
     * @for Workflow
     * @public
     */
    @attr('string', { defaultValue: 'Draft' }) status;

    /**
     * The ids of the projects the workflow runs in, as JSON text; empty means every project
     *
     * @property scope
     * @for Workflow
     * @public
     */
    @attr('string') scope;

    /**
     * How many times the workflow was activated, written by Gaia
     *
     * @property version
     * @for Workflow
     * @public
     */
    @attr('number') version;

    /**
     * @property ownerId
     * @for Workflow
     * @public
     */
    @attr('string') ownerId;

    /**
     * @property dateCreated
     * @for Workflow
     * @public
     */
    @attr('string') dateCreated;

    /**
     * @property dateModified
     * @for Workflow
     * @public
     */
    @attr('string') dateModified;
}
