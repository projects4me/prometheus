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
export default Model.extend({

    /**
     * Access Token
     *
     * @property access_token
     * @type String
     * @for Token
     * @private
     */
    access_token: attr('string'),

    /**
     * Expires In
     *
     * @property expires_in
     * @type Date
     * @for Token
     * @private
     */
    expires_in: attr('date'),

    /**
     * Token Type
     *
     * @property token_type
     * @type String
     * @for Token
     * @private
     */
    token_type: attr('string'),

    /**
     * Scope
     *
     * @property scope
     * @type String
     * @for Token
     * @private
     */
    scope: attr('string'),

    /**
     * Refresh Token
     *
     * @property refresh_token
     * @type String
     * @for Token
     * @private
     */
    refresh_token: attr('string'),

    /**
     * Grent Type
     *
     * @property grant_type
     * @type String
     * @for Token
     * @private
     */
    grant_type:attr('string'),

    /**
     * Client Id
     *
     * @property client_id
     * @type String
     * @for Token
     * @private
     */
    client_id:attr('string'),

    /**
     * Client Secret
     *
     * @property client_secret
     * @type String
     * @for Token
     * @private
     */
    client_secret:attr('string')

});