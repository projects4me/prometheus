/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The token model
 *
 * @class Token
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class TokenModel extends Model {

    /**
     * Access Token
     *
     * @property access_token
     * @type String
     * @for Token
     * @private
     */
    @attr('string') access_token;

    /**
     * Expires In
     *
     * @property expires_in
     * @type Date
     * @for Token
     * @private
     */
    @attr('date') expires_in;

    /**
     * Token Type
     *
     * @property token_type
     * @type String
     * @for Token
     * @private
     */
    @attr('string') token_type;

    /**
     * Scope
     *
     * @property scope
     * @type String
     * @for Token
     * @private
     */
    @attr('string') scope;

    /**
     * Refresh Token
     *
     * @property refresh_token
     * @type String
     * @for Token
     * @private
     */
    @attr('string') refresh_token;

    /**
     * Grent Type
     *
     * @property grant_type
     * @type String
     * @for Token
     * @private
     */
    @attr('string') grant_type;

    /**
     * Client Id
     *
     * @property client_id
     * @type String
     * @for Token
     * @private
     */
    @attr('string') client_id;

    /**
     * Client Secret
     *
     * @property client_secret
     * @type String
     * @for Token
     * @private
     */
    @attr('string') client_secret;

}