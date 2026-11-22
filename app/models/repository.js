/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The repository model. A repository with a projectId belongs to that project of the workspace; without one it is
 * shared by the whole workspace.
 *
 * @class Repository
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class RepositoryModel extends Model {

    /**
     * Name of the repository
     *
     * @property name
     * @type String
     * @for Repository
     */
    @attr('string') name;

    /**
     * Url of the repository
     *
     * @property url
     * @type String
     * @for Repository
     */
    @attr('string') url;

    /**
     * Id of the workspace the repository belongs to
     *
     * @property workspaceId
     * @type String
     * @for Repository
     */
    @attr('string') workspaceId;

    /**
     * Id of the project the repository belongs to, empty for a workspace-wide repository
     *
     * @property projectId
     * @type String
     * @for Repository
     */
    @attr('string') projectId;

    /**
     * The branch the agents start from and open their pull requests against
     *
     * @property baseBranch
     * @type String
     * @for Repository
     */
    @attr('string') baseBranch;

}
