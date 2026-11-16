/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * The membership model — project membership only (userId + projectId).
 * Application-wide role assignment is handled by the userrole resource.
 *
 * @class Membership
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class MembershipModel extends Model {

    /**
     * The identifier of the project this membership grants access to.
     *
     * @property projectId
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') projectId;

    /**
     * The identifier of the user who is a member of the project.
     *
     * @property userId
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') userId;

    /**
     * The soft deletion flag for the membership
     *
     * @property deleted
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') deleted;

    /**
     * The date on which this membership was created
     *
     * @property dateCreated
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The date on which this membership was last modified
     *
     * @property dateModified
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') dateModified;

    /**
     * The identifier of the user who created the membership
     *
     * @property createdUser
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who last modified the membership
     *
     * @property modifiedUser
     * @type String
     * @for Membership
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The project to which this membership belongs.
     *
     * @property project
     * @type {Prometheus.Model.Project}
     * @for Membership
     * @private
     */
    @belongsTo('project', { async: true, inverse: 'memberships' }) project;

    /**
     * The user to which this membership belongs.
     *
     * @property user
     * @type {Prometheus.Model.User}
     * @for Membership
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) user;
}
