/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The ideamessage model, one entry in the conversation of an idea
 *
 * @class Ideamessage
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class IdeamessageModel extends Model {

    /**
     * @property ideaId
     * @for Ideamessage
     * @public
     */
    @attr('string') ideaId;

    /**
     * @property body
     * @for Ideamessage
     * @public
     */
    @attr('string') body;

    /**
     * @property kind
     * @for Ideamessage
     * @public
     */
    @attr('string') kind;

    /**
     * @property steps
     * @for Ideamessage
     * @public
     */
    @attr('json-list') steps;

    /**
     * The screens of the message, a JSON array of {uploadId, key, title, version, width, height}
     *
     * @property screens
     * @for Ideamessage
     * @public
     */
    @attr('json-list') screens;

    /**
     * @property ideaplanId
     * @for Ideamessage
     * @public
     */
    @attr('string') ideaplanId;

    /**
     * @property costUsd
     * @for Ideamessage
     * @public
     */
    @attr('number') costUsd;

    /**
     * @property createdUser
     * @for Ideamessage
     * @public
     */
    @attr('string') createdUser;

    /**
     * @property createdUserName
     * @for Ideamessage
     * @public
     */
    @attr('string') createdUserName;

    /**
     * @property dateCreated
     * @for Ideamessage
     * @public
     */
    @attr('string') dateCreated;
}
