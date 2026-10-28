/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The issuetype model
 *
 * @class Issuetype
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class IssuetypeModel extends Model {

    /**
     * Name of the issue type
     *
     * @property name
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') name;

    /**
     * Date on which the issue type was created
     *
     * @property dateCreated
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') dateCreated;

    /**
     * Date on which the issue type was last modified
     *
     * @property dateModified
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') dateModified;

    /**
     * Soft deletion flag
     *
     * @property deleted
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') deleted;

    /**
     * Description of the issue type
     *
     * @property description
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') description;

    /**
     * Identifier of the create who created the issue type
     *
     * @property createdUser
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') createdUser;

    /**
     * The identifier of the user who last modified the issue type
     *
     * @property modifiedUser
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') modifiedUser;

    /**
     * The identifier of the project the issue type belongs to
     *
     * @property projectId
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') projectId;

    /**
     * The system flag, the issue types with system flag cannot be deleted and are
     * inherited by the projects by default
     *
     * @property system
     * @type String
     * @for Issuetype
     * @private
     */
    @attr('string') system;

    /**
     * The number of projects using an issue type of this name. Only returned
     * when the list is requested with projectCount.
     *
     * @property projectCount
     * @type Number
     * @for Issuetype
     * @private
     */
    @attr('number') projectCount;


    /**
     * The label of the issue type per language, locale => label
     *
     * @property translations
     * @type Object
     * @for Issuetype
     * @public
     */
    @attr() translations;
}
