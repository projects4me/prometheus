/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The wiki model
 *
 * @class Wiki
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * Name of the wiki page
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    name: DS.attr('string'),

    /**
     * Date on which the wiki page was created
     *
     * @property dateCreated
     * @type String
     * @for Wiki
     * @private
     */
    dateCreated: DS.attr('string'),

    /**
     * Date on which the wiki page was last modified
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    dateModified: DS.attr('string'),

    /**
     * The identifier of the user who created the wiki page
     *
     * @property createdUser
     * @type String
     * @for Wiki
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The name of the use who created the wiki page
     *
     * @property createdUserName
     * @type String
     * @for Wiki
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The identifier of the user who last modified the wiki page
     *
     * @property modifiedUser
     * @type String
     * @for Wiki
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The name of the user who last modified the wiki page
     *
     * @property modifiedUserName
     * @type String
     * @for Wiki
     * @private
     */
    modifiedUserName: DS.attr('string'),

    /**
     * The soft deletion flag of the wiki page
     *
     * @property deleted
     * @type String
     * @for Wiki
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * The status of the wiki page
     *
     * @property status
     * @type String
     * @for Wiki
     * @private
     */
    status: DS.attr('string'),

    /**
     * The lock flag of the wiki page
     *
     * @property locked
     * @type String
     * @for Wiki
     * @private
     */
    locked: DS.attr('string'),

    /**
     * The upvotes given to the project
     *
     * @property upvotes
     * @type String
     * @for Wiki
     * @private
     */
    upvotes: DS.attr('string'),

    /**
     * The identifier of the project that the wiki page is linked to
     *
     * @property projectId
     * @type String
     * @for Wiki
     * @private
     */
    projectId: DS.attr('string'),

    /**
     * The mark up of the wiki page
     *
     * @property markUp
     * @type String
     * @for Wiki
     * @private
     */
    markUp: DS.attr('string'),

    /**
     * The identifier of the parent wiki page
     *
     * @property parentId
     * @type String
     * @for Wiki
     * @private
     */
    parentId: DS.attr('string'),

    /**
     * The tags for the wiki page
     *
     * @property tags
     * @type Relationship
     * @for Wiki
     * @private
     */
    tag: DS.hasMany('tag'),

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type Relationship
     * @for Wiki
     * @private
     */
    tagged: DS.hasMany('tagged'),


    /**
     * The votes for this wiki page
     *
     * @property vote
     * @type Relationship
     * @for Wiki
     * @private
     */
    vote: DS.hasMany('vote')

});