/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * The saved searches model
 *
 * @class Savedsearch
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class SavedsearchModel extends Model {

    /**
     * Name of the saved search
     *
     * @property name
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') name;

    /**
     * The date on which the saved search was created
     *
     * @property dateCreated
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') dateCreated;

    /**
     * The identifier of the user who saved the search
     *
     * @property createUser
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') createdUser;

    /**
     * Name of the user who saved this search
     *
     * @property createdUserName
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') createdUserName;

    /**
     * Has this model been deleted
     *
     * @property deleted
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') deleted;

    /**
     * The flag that indicates whether this search is available publicly
     *
     * @property public
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('bool') public;

    /**
     * The query string for the search
     *
     * @property query
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') searchquery;

    /**
     * The module for which this saved search was created
     *
     * @property relatedTo
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') relatedTo;

    /**
     * The project for which this search was created
     *
     * @property projectId
     * @type String
     * @for Savedsearch
     * @private
     */
    @attr('string') projectId;

    /**
     * The user who saved this search
     *
     * @property createdBy
     * @type UserModel
     * @for Savedsearch
     * @private
     */
    @belongsTo('user', { async: true, inverse: null }) createdBy;

}