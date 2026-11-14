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
export default class UserqualificationModel extends Model {

    /**
     * The user this qualification belongs to.
     *
     * @property userId
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') userId;

    /**
     * Qualification kind e.g. education, certification.
     *
     * @property type
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') type;

    /**
     * Degree or certification title.
     *
     * @property title
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') title;

    /**
     * School, university, or issuing institution.
     *
     * @property institution
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') institution;

    /**
     * Completion year.
     *
     * @property completionYear
     * @type Number
     * @for Userqualification
     * @private
     */
    @attr('number') completionYear;

    /**
     * Soft deletion flag.
     *
     * @property deleted
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') deleted;

    /**
     * Date the record was created.
     *
     * @property dateCreated
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date the record was last modified.
     *
     * @property dateModified
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') dateModified;

    /**
     * Identifier of the user who created the record.
     *
     * @property createdUser
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') createdUser;

    /**
     * Display name of the user who created the record.
     *
     * @property createdUserName
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') createdUserName;

    /**
     * Identifier of the user who last modified the record.
     *
     * @property modifiedUser
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * Display name of the user who last modified the record.
     *
     * @property modifiedUserName
     * @type String
     * @for Userqualification
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The user this qualification belongs to.
     *
     * @property user
     * @type {Prometheus.Models.User}
     * @for Userqualification
     * @private
     */
    @belongsTo('user', { async: true, inverse: 'qualifications' }) user;

}
