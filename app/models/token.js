/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import DS from "ember-data";

/**
 * The token model
 *
 * @class Token
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default DS.Model.extend({

    /**
     * Access Token
     *
     * @property access_token
     * @type String
     * @for Token
     * @private
     */
    access_token: DS.attr('string'),

    /**
     * Expires In
     *
     * @property expires_in
     * @type Date
     * @for Token
     * @private
     */
    expires_in: DS.attr('date'),

    /**
     * Token Type
     *
     * @property token_type
     * @type String
     * @for Token
     * @private
     */
    token_type: DS.attr('string'),

    /**
     * Scope
     *
     * @property scope
     * @type String
     * @for Token
     * @private
     */
    scope: DS.attr('string'),

    /**
     * Refresh Token
     *
     * @property refresh_token
     * @type String
     * @for Token
     * @private
     */
    refresh_token: DS.attr('string'),

    /**
     * Grent Type
     *
     * @property grant_type
     * @type String
     * @for Token
     * @private
     */
    grant_type:DS.attr('string'),

    /**
     * Client Id
     *
     * @property client_id
     * @type String
     * @for Token
     * @private
     */
    client_id:DS.attr('string'),

    /**
     * Client Secret
     *
     * @property client_secret
     * @type String
     * @for Token
     * @private
     */
    client_secret:DS.attr('string')

});