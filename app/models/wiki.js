/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr,hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Wiki
 */
const Validations = buildValidations({
    name: validator('presence', true),
    projectId: validator('presence', true),
    markUp: validator('presence', true)
});

/**
 * The wiki model
 *
 * @class Wiki
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * Name of the wiki page
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    name: attr('string'),

    /**
     * Date on which the wiki page was created
     *
     * @property dateCreated
     * @type String
     * @for Wiki
     * @private
     */
    dateCreated: attr('string'),

    /**
     * Date on which the wiki page was last modified
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    dateModified: attr('string'),

    /**
     * The identifier of the user who created the wiki page
     *
     * @property createdUser
     * @type String
     * @for Wiki
     * @private
     */
    createdUser: attr('string'),

    /**
     * The name of the use who created the wiki page
     *
     * @property createdUserName
     * @type String
     * @for Wiki
     * @private
     */
    createdUserName: attr('string'),

    /**
     * The identifier of the user who last modified the wiki page
     *
     * @property modifiedUser
     * @type String
     * @for Wiki
     * @private
     */
    modifiedUser: attr('string'),

    /**
     * The name of the user who last modified the wiki page
     *
     * @property modifiedUserName
     * @type String
     * @for Wiki
     * @private
     */
    modifiedUserName: attr('string'),

    /**
     * The soft deletion flag of the wiki page
     *
     * @property deleted
     * @type String
     * @for Wiki
     * @private
     */
    deleted: attr('string'),

    /**
     * The status of the wiki page
     *
     * @property status
     * @type String
     * @for Wiki
     * @private
     */
    status: attr('string'),

    /**
     * The lock flag of the wiki page
     *
     * @property locked
     * @type String
     * @for Wiki
     * @private
     */
    locked: attr('string'),

    /**
     * The upvotes given to the project
     *
     * @property upvotes
     * @type String
     * @for Wiki
     * @private
     */
    upvotes: attr('string'),

    /**
     * The identifier of the project that the wiki page is linked to
     *
     * @property projectId
     * @type String
     * @for Wiki
     * @private
     */
    projectId: attr('string'),

    /**
     * The mark up of the wiki page
     *
     * @property markUp
     * @type String
     * @for Wiki
     * @private
     */
    markUp: attr('string'),

    /**
     * The identifier of the parent wiki page
     *
     * @property parentId
     * @type String
     * @for Wiki
     * @private
     */
    parentId: attr('string'),

    /**
     * The tags for the wiki page
     *
     * @property tags
     * @type Relationship
     * @for Wiki
     * @private
     */
    tag: hasMany('tag'),

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type Relationship
     * @for Wiki
     * @private
     */
    tagged: hasMany('tagged'),

    /**
     * The votes for this wiki page
     *
     * @property vote
     * @type Relationship
     * @for Wiki
     * @private
     */
    vote: hasMany('vote'),

    /**
     * The file associated with this wiki
     *
     * @property files
     * @type Relationship
     * @for Wiki
     * @private
     */
    files: hasMany('upload')

});