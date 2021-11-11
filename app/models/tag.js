/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Tag
 */
const Validations = buildValidations({
    tag: validator('presence', true)
});

/**
 * The tagged room model
 *
 * @class Tagged
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Model.extend(Validations, {

    /**
     * The tag
     *
     * @property tag
     * @type String
     * @for Tagged
     * @private
     */
    "tag": attr('string'),

    /**
     * The date on which the tag was created
     *
     * @property dateCreated
     * @type String
     * @for Tagged
     * @private
     */
    "dateCreated": attr('string'),

    /**
     * The date on which the tag was last mofidied
     *
     * @property dateModified
     * @type String
     * @for Tagged
     * @private
     */
    "dateModified": attr('string'),

    /**
     * The soft deletion flag of the tag
     *
     * @property tag
     * @type String
     * @for Tagged
     * @private
     */
    "deleted": attr('string'),

    /**
     * The identifier of the user who last created the tag
     *
     * @property createdUser
     * @type String
     * @for Tagged
     * @private
     */
    "createdUser": attr('string'),

    /**
     * The name of the user who created the tag
     *
     * @property createdUserName
     * @type String
     * @for Tagged
     * @private
     */
    "createdUserName": attr('string'),

    /**
     * The identifier of the user who last modified the tag
     *
     * @property modifiedUser
     * @type String
     * @for Tagged
     * @private
     */
    "modifiedUser": attr('string'),

    /**
     * The name of the user who last modified the tag
     *
     * @property modifiedUserName
     * @type String
     * @for Tagged
     * @private
     */
    "modifiedUserName": attr('string'),

    /**
     * The user who created the tag
     *
     * @property createdBy
     * @type UserModel
     * @for Savedsearch
     * @private
     */
    createdBy: belongsTo('user', { inverse: null }),

    /**
     * The user last modified the tag
     *
     * @property modifiedBy
     * @type UserModel
     * @for Savedsearch
     * @private
     */
    modifiedBy: belongsTo('user', { inverse: null }),

    /**
     * The wiki this tag is associated with
     *
     * @property wiki
     * @type WikiModel
     * @for Savedsearch
     * @private
     */
    wiki: hasMany('wiki'),

    /**
     * The issue this tag is associated with
     *
     * @property issue
     * @type IssueModel
     * @for Savedsearch
     * @private
     */
    issue: hasMany('issue'),

    /**
     * The project this tag is associated with
     *
     * @property project
     * @type ProjectModel
     * @for Savedsearch
     * @private
     */
    project: hasMany('project')

});