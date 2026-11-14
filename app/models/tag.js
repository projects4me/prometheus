/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The tagged room model
 *
 * @class Tagged
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class TagModel extends Model {

    /**
     * The tag
     *
     * @property tag
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') tag;

    /**
     * The date on which the tag was created
     *
     * @property dateCreated
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which the tag was last mofidied
     *
     * @property dateModified
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') dateModified;

    /**
     * The soft deletion flag of the tag
     *
     * @property tag
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') deleted;

    /**
     * The identifier of the user who last created the tag
     *
     * @property createdUser
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') createdUser;

    /**
     * The name of the user who created the tag
     *
     * @property createdUserName
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') createdUserName;

    /**
     * The identifier of the user who last modified the tag
     *
     * @property modifiedUser
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The name of the user who last modified the tag
     *
     * @property modifiedUserName
     * @type String
     * @for Tagged
     * @private
     */
    @attr('string') modifiedUserName;

    /**
     * The user who created the tag
     *
     * @property createdBy
     * @type UserModel
     * @for Savedsearch
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The user last modified the tag
     *
     * @property modifiedBy
     * @type UserModel
     * @for Savedsearch
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) modifiedBy;

    /**
     * The wiki this tag is associated with
     *
     * @property wiki
     * @type WikiModel
     * @for Savedsearch
     * @private
     */
    @hasMany('wiki', { async: true, inverse: 'tag' }) wiki;

    /**
     * The issue this tag is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Savedsearch
     * @private
     */
    @hasMany('issue', { async: true, inverse: null }) issue;

    /**
     * The project this tag is associated with
     *
     * @property project
     * @type ProjectModel
     * @for Savedsearch
     * @private
     */
    @hasMany('project', { async: true, inverse: null }) project;

}