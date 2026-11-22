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
     * The cross-project issue links of the workspace (read only, computed by Gaia)
     *
     * @property crossProjectLinkCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') crossProjectLinkCount;

    /**
     * The cross-project links that block (read only, computed by Gaia)
     *
     * @property crossProjectBlockingCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') crossProjectBlockingCount;

    /**
     * The whether the bound runtime was used in the last 5 minutes (read only, computed by Gaia)
     *
     * @property runtimeOnline
     * @type Boolean
     * @for Workspace
     * @private
     */
    @attr('boolean') runtimeOnline;

    /**
     * The runs in progress over the projects (read only, computed by Gaia)
     *
     * @property runsInProgress
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') runsInProgress;

    /**
     * The repositories of the workspace (read only, computed by Gaia)
     *
     * @property repositoryCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') repositoryCount;

    /**
     * The repositories that belong to a project (read only, computed by Gaia)
     *
     * @property projectRepositoryCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') projectRepositoryCount;

    /**
     * The agents of the workspace (read only, computed by Gaia)
     *
     * @property agentCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') agentCount;

    /**
     * The tool servers of the workspace (read only, computed by Gaia)
     *
     * @property toolserverCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') toolserverCount;

    /**
     * The skills of the workspace (read only, computed by Gaia)
     *
     * @property skillCount
     * @type Number
     * @for Workspace
     * @private
     */
    @attr('number') skillCount;

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
     * The runtime (service client) the workspace is bound to
     *
     * @property runtime
     * @type Serviceclient
     * @for Workspace
     * @private
     */
    @belongsTo('serviceclient', { async: true, inverse: null }) runtime;

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
