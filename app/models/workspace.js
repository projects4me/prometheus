/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

/**
 * The workspace model, every project belongs to exactly one workspace
 *
 * @class Workspace
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class WorkspaceModel extends Model {

    /**
     * Name of the workspace
     *
     * @property name
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') name;

    /**
     * Unique short code of the workspace
     *
     * @property shortCode
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') shortCode;

    /**
     * Description of the workspace
     *
     * @property description
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') description;

    /**
     * Number of projects in the workspace (read only, computed by Gaia)
     *
     * @property projectCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') projectCount;

    /**
     * Number of members of the workspace (read only, computed by Gaia)
     *
     * @property memberCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') memberCount;

    /**
     * Id of the user who created the workspace
     *
     * @property createdUser
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') createdUser;

    /**
     * Name of the user who created the workspace
     *
     * @property createdUserName
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') createdUserName;

    /**
     * Date on which the workspace was created
     *
     * @property dateCreated
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the workspace was last modified
     *
     * @property dateModified
     * @type String
     * @for Workspace
     * @private
     */
    @attr('string') dateModified;

    /**
     * User who created the workspace
     *
     * @property createdBy
     * @type User
     * @for Workspace
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

    /**
     * The projects of this workspace
     *
     * @property projects
     * @type Project[]
     * @for Workspace
     * @private
     */
    @hasMany('project', { async: true, inverse: 'workspace' }) projects;
}
