/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The wiki model
 *
 * @class Wiki
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class WikiModel extends Model {

    /**
     * Name of the wiki page
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') name;

    /**
     * Date on which the wiki page was created
     *
     * @property dateCreated
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the wiki page was last modified
     *
     * @property name
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user who created the wiki page
     *
     * @property createdUser
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the use who created the wiki page
     *
     * @property createdUserName
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the wiki page
     *
     * @property modifiedUser
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the wiki page
     *
     * @property modifiedUserName
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The soft deletion flag of the wiki page
     *
     * @property deleted
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') deleted;

    /**
     * The status of the wiki page
     *
     * @property status
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') status;

    /**
     * The lock flag of the wiki page
     *
     * @property locked
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') locked;

    /**
     * The upvotes given to the project
     *
     * @property upvotes
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') upvotes;

    /**
     * The identifier of the project that the wiki page is linked to
     *
     * @property projectId
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') projectId;

    /**
     * The mark up of the wiki page
     *
     * @property markUp
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') markUp;

    /**
     * The identifier of the parent wiki page
     *
     * @property parentId
     * @type String
     * @for Wiki
     * @private
     */
    @attr('string') parentId;

    /**
     * The user who created the wiki
     *
     * @property createdBy
     * @type UserModel
     * @for Wiki
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user who last modified the wiki
     *
     * @property modifiedBy
     * @type UserModel
     * @for Wiki
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The tags for the wiki page
     *
     * @property tags
     * @type TagModel
     * @for Wiki
     * @private
     */
    @hasMany('tag', { async: true, inverse: 'wiki' }) tag;

    /**
     * These are the tag relationship entries
     *
     * @property tagged
     * @type TaggedModel
     * @for Wiki
     * @private
     */
    @hasMany('tagged', { async: true, inverse: 'wiki' }) tagged;

    /**
     * The votes for this wiki page
     *
     * @property vote
     * @type VoteModel
     * @for Wiki
     * @private
     */
    @hasMany('vote', { async: true, inverse: 'wiki' }) vote;

    /**
     * The file associated with this wiki
     *
     * @property files
     * @type UploadModel
     * @for Wiki
     * @private
     */
    @hasMany('upload', { async: true, inverse: null }) files;

}