/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";
import { validator, buildValidations } from 'ember-cp-validations';

/**
 * These are the validation that are applied on the model
 *
 * @property Validations
 * @module Comment
 */
const Validations = buildValidations({
    comment: validator('presence', true),
    relatedId: validator('presence', true),
    relatedTo: validator('presence', true)
});

/**
 * The comment model
 *
 * @class Comment
 * @namespace Prometheus.Models
 * @extend DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend(Validations, {

    /**
     * The date on which the comment was created
     *
     * @property dateCreated
     * @type String
     * @for Comment
     * @private
     */
    dateCreated: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The date on which the comment was last modified
     *
     * @property dateModified
     * @type String
     * @for Comment
     * @private
     */
    dateModified: DS.attr('string',{defaultValue:function(){return 'CURRENT_DATETIME';}}),

    /**
     * The soft deletion flag of the comment
     *
     * @property deleted
     * @type String
     * @for Comment
     * @private
     */
    deleted: DS.attr('string'),

    /**
     * The comment
     *
     * @property comment
     * @type String
     * @for CommentModel
     * @private
     */
    comment: DS.attr('string'),

    /**
     * The identifier of the user who created the comment
     *
     * @property createdUser
     * @type String
     * @for Comment
     * @private
     */
    createdUser: DS.attr('string'),

    /**
     * The name of the user who created the comment
     *
     * @property createdUserName
     * @type String
     * @for Comment
     * @private
     */
    createdUserName: DS.attr('string'),

    /**
     * The identifier of the user who last modified the comment
     *
     * @property modifiedUser
     * @type String
     * @for Comment
     * @private
     */
    modifiedUser: DS.attr('string'),

    /**
     * The name of the user who last modified the comment
     *
     * @property modifiedUserName
     * @type String
     * @for Comment
     * @private
     */
    modifiedUserName: DS.attr('string'),

    /**
     * The entity the comment is related to
     *
     * @property relatedTo
     * @type String
     * @for Comment
     * @private
     */
    relatedTo: DS.attr('string'),

    /**
     * The identifier of the record the comment is related to
     *
     * @property relatedId
     * @type String
     * @for Comment
     * @private
     */
    relatedId: DS.attr('string'),

    /**
     * The user who created the comment
     *
     * @property createdby
     * @type Relationship
     * @for Comment
     * @private
     */
    createdby: DS.belongsTo('user'),

    /**
     * The conversation room the comment is associated with
     *
     * @property conversationroom
     * @type Relationship
     * @for Comment
     * @private
     */
    conversationroom: DS.belongsTo('conversationroom')

});