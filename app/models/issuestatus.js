/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The issuestatus model
 *
 * @class Issuestatus
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class IssuestatusModel extends Model {

    /**
     * Name of the issue status
     *
     * @property name
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') name;

    /**
     * Date on which the issue status was created
     *
     * @property dateCreated
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the issue status was last modified
     *
     * @property dateModified
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') dateModified;

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') deleted;

    /**
     * Description of the issue status
     *
     * @property description
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') description;

    /**
     * Identifier of the user who created the issue status
     *
     * @property createdUser
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who last modified the issue status
     *
     * @property modifiedUser
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The identifier of the project the issue status belongs to
     *
     * @property projectId
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') projectId;

    /**
     * The system flag, the issue statuses with system flag cannot be deleted and are
     * inherited by the projects by default
     *
     * @property system
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') system;

    /**
     * This flag tells us that whether the status is in the done category or not. For example
     * when we have a issue of 'in progress' status then we know that it's not done yet so we
     * feed the value of done to 0 in that case. 
     *
     * @property done
     * @type String
     * @for Issuestatus
     * @private
     */
    @attr('string') done;
}