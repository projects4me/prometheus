/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * Education or certification entry on a user profile.
 *
 * Distinguished by {@link type}: e.g. `education`, `certification`.
 *
 * @class Userqualification
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default Model.extend({

    /**
     * The user this qualification belongs to.
     *
     * @property userId
     * @type String
     * @for Userqualification
     * @private
     */
    userId: attr('string'),

    /**
     * Qualification kind e.g. education, certification.
     *
     * @property type
     * @type String
     * @for Userqualification
     * @private
     */
    type: attr('string'),

    /**
     * Degree or certification title.
     *
     * @property title
     * @type String
     * @for Userqualification
     * @private
     */
    title: attr('string'),

    /**
     * School, university, or issuing institution.
     *
     * @property institution
     * @type String
     * @for Userqualification
     * @private
     */
    institution: attr('string'),

    /**
     * Completion year.
     *
     * @property completionYear
     * @type Number
     * @for Userqualification
     * @private
     */
    completionYear: attr('number'),

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userqualification
     * @private
     */
    deleted: attr('string'),

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userqualification
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userqualification
     * @private
     */
    dateModified: attr('string'),

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userqualification
     * @private
     */
    createdUser: attr('string'),

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userqualification
     * @private
     */
    createdUserName: attr('string'),

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userqualification
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userqualification
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The user this qualification belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userqualification
     * @private
     */
    user: belongsTo('user'),

});
