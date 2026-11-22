/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * A person (or agent) that is a member of a workspace, one row per person however many of the workspace's projects
 * they are in. Read-only: Gaia computes it from the memberships.
 *
 * @class Workspacemember
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class WorkspacememberModel extends Model {

    /**
     * The identifier of the workspace
     *
     * @property workspaceId
     * @type String
     * @for Workspacemember
     * @private
     */
    @attr('string') workspaceId;

    /**
     * The identifier of the user
     *
     * @property userId
     * @type String
     * @for Workspacemember
     * @private
     */
    @attr('string') userId;

    /**
     * The type of the user, person or agent
     *
     * @property type
     * @type String
     * @for Workspacemember
     * @private
     */
    @attr('string') type;

    /**
     * The number of the workspace's projects the user is a member of
     *
     * @property projectCount
     * @type Number
     * @for Workspacemember
     * @private
     */
    @attr('number') projectCount;

    /**
     * The number of open issues assigned to the user in the workspace
     *
     * @property openIssues
     * @type Number
     * @for Workspacemember
     * @private
     */
    @attr('number') openIssues;

    /**
     * The user
     *
     * @property user
     * @type User
     * @for Workspacemember
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) user;
}
