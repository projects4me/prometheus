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
export default class DashboardModel extends Model {

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') userId;

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') name;

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user to whom this dashboard
     * belongs to
     *
     * @property userId
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') widgets;

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Dashboard
     * @private
     */
    @attr('string') deleted;
    
}