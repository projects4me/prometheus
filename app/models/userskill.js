/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * A skill associated with a user profile.
 *
 * @class Userskill
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default Model.extend({

    /**
     * The user this skill belongs to.
     *
     * @property userId
     * @type String
     * @for Userskill
     * @private
     */
    userId: attr('string'),

    /**
     * The skill name e.g. PHP, Ember.js.
     *
     * @property name
     * @type String
     * @for Userskill
     * @private
     */
    name: attr('string'),

    /**
     * Proficiency level for the skill.
     *
     * @property proficiencyLevel
     * @type String
     * @for Userskill
     * @private
     */
    proficiencyLevel: attr('string'),

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userskill
     * @private
     */
    deleted: attr('string'),

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userskill
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userskill
     * @private
     */
    dateModified: attr('string'),

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userskill
     * @private
     */
    createdUser: attr('string'),

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userskill
     * @private
     */
    createdUserName: attr('string'),

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userskill
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userskill
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The user this skill belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userskill
     * @private
     */
    user: belongsTo('user'),

});
