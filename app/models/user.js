/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,belongsTo,hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module User
 */
const Validations = buildValidations({
    username: validator('presence', true),
    email: validator('presence', true),
    name: validator('presence', true)
});

/**
 * The user model
 *
 * @class User
 * @namespace Prometheus.Model
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * Username
     *
     * @property username
     * @type String
     * @for User
     * @private
     */
    username: attr('string'),

    /**
     * Email Address
     *
     * @property email
     * @type String
     * @for User
     * @private
     */
    email: attr('string'),

    /**
     * Status
     *
     * @property status
     * @type String
     * @for User
     * @private
     */
    status: attr('string'),

    /**
     * Name
     *
     * @property name
     * @type String
     * @for User
     * @private
     */
    name: attr('string'),

    /**
     * Date on which the user was created
     *
     * @property dateCreated
     * @type String
     * @for User
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the user was last modified
     *
     * @property dateModified
     * @type String
     * @for User
     * @private
     */
    dateModified: attr('string'),

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for User
     * @private
     */
    deleted: attr('string'),

    /**
     * Description
     *
     * @property description
     * @type String
     * @for User
     * @private
     */
    description: attr('string'),

    /**
     * User who created this user
     *
     * @property createdUser
     * @type String
     * @for User
     * @private
     */
    createdUser: attr('string'),

    /**
     * User who modified this user
     *
     * @property modifiedUser
     * @type String
     * @for User
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * Title of the user
     *
     * @property title
     * @type String
     * @for User
     * @private
     */
    title: attr('string'),

    /**
     * Phone number of the user
     *
     * @property phone
     * @type String
     * @for User
     * @private
     */
    phone: attr('string'),

    /**
     * A user's education
     *
     * @property education
     * @type String
     * @for User
     * @private
     */
    education: attr('string'),

    /**
     * The users's dashboard
     *
     * @property dashboard
     * @type DashboardModel
     * @for User
     * @private
     */
    dashboard: belongsTo('dashboard'),

    /**
     * The skills for a user
     *
     * @property skills
     * @type TagModel
     * @for User
     * @private
     */
    skills: hasMany('tag'),

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type TaggedModel
     * @for User
     * @private
     */
    tagged: hasMany('tagged'),
});