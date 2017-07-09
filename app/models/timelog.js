/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The time log model
 *
 * @class Timelog
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * The date on which the time log entry was made
     *
     * @property dateCreated
     * @type String
     * @for Timelog
     * @private
     */
    "dateCreated": DS.attr('string'),

    /**
     * The date on which the time log entry was last modified
     *
     * @property dateModified
     * @type String
     * @for Timelog
     * @private
     */
    "dateModified": DS.attr('string'),

    /**
     * The soft deletion flag of the time log entry
     *
     * @property deleted
     * @type String
     * @for Timelog
     * @private
     */
    "deleted": DS.attr('string'),

    /**
     * The identifier of the user who created the time log entry
     *
     * @property createdUser
     * @type String
     * @for Timelog
     * @private
     */
    "createdUser": DS.attr('string'),

    /**
     * The identifier of the user who last modifed the time log entry
     *
     * @property modifedUser
     * @type String
     * @for Timelog
     * @private
     */
    "modifiedUser": DS.attr('string'),

    /**
     * The identifier of the issue for which the time log entry was made
     *
     * @property issueId
     * @type String
     * @for Timelog
     * @private
     */
    "issueId": DS.attr('string'),

    /**
     * The minutes part of the time log entry
     *
     * @property minutes
     * @type String
     * @for Timelog
     * @private
     */
    "minutes": DS.attr('string'),

    /**
     * The hours part of the time log entry
     *
     * @property hours
     * @type String
     * @for Timelog
     * @private
     */
    "hours": DS.attr('string'),

    /**
     * The days part of the time log entry
     *
     * @property days
     * @type String
     * @for Timelog
     * @private
     */
    "days": DS.attr('string'),

    /**
     * The context in which the time log entry was made, currently we are supporting
     * estiamted time and the spent time. The estimated time is represented by 'est'
     * and the spent time is represented by 'spent'
     *
     * @property context
     * @type String
     * @for Timelog
     * @private
     */
    "context": DS.attr('string')

});