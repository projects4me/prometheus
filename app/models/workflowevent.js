/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflowevent model, one trigger of Gaia's read-only trigger catalog (GET /workflowevent): the event, the
 * module that raises it and the payload paths filters and expressions can use. Its id is the trigger kind.
 *
 * @class Workflowevent
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkfloweventModel extends Model {

    /**
     * The trigger kind, such as issue.created or schedule
     *
     * @property name
     * @for Workflowevent
     * @public
     */
    @attr('string') name;

    /**
     * @property label
     * @for Workflowevent
     * @public
     */
    @attr('string') label;

    /**
     * The model that raises the event, null for the schedule
     *
     * @property module
     * @for Workflowevent
     * @public
     */
    @attr('string') module;

    /**
     * create or update, null for the schedule
     *
     * @property on
     * @for Workflowevent
     * @public
     */
    @attr('string') on;

    /**
     * The fields an update event watches; none means any change
     *
     * @property watchedFields
     * @for Workflowevent
     * @public
     */
    @attr() watchedFields;

    /**
     * The payload paths and their types, as [{ path, type }]
     *
     * @property fields
     * @for Workflowevent
     * @public
     */
    @attr() fields;
}
