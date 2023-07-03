/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The dashboard model
 *
 * @class Dashboard
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend({

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    userId: attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    name: attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    dateCreated: attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    dateModified: attr('string'),

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    widgets: attr('string'),

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Dashboard
     * @private
     */
    deleted: attr('string')
    
});