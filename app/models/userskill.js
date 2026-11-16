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
export default class UserskillModel extends Model {

    /**
     * The user this skill belongs to.
     *
     * @property userId
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') userId;

    /**
     * The skill name e.g. PHP, Ember.js.
     *
     * @property name
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') name;

    /**
     * Proficiency level for the skill.
     *
     * @property proficiencyLevel
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') proficiencyLevel;

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') deleted;

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') dateModified;

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') createdUser;

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') createdUserName;

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userskill
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The user this skill belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userskill
     * @private
     */
    @belongsTo('user', { async: true, inverse: 'skills' }) user;

}
