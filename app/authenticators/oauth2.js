/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from "prometheus/config/environment";
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { makeArray } from '@ember/array';
import { assign } from '@ember/polyfills';
import Logger from 'js-logger';

/**
 * This class allows the application to authenticate with using a password grant
 *
 * @class OAuth2Authenticator
 * @namespace Prometheus.Authenticators
 * @extends OAuth2PasswordGrant
 * @author Hammad Hassan gollomer@gmail.com
 */
export default OAuth2PasswordGrant.extend({

    /**
     * The client_id to be sent to the authentication server
     *
     * @property clientId
     * @type String
     * @default null
     * @public
     */
    apiClientId: ENV.api.clientId,

    /**
     * The client_secret to be sent to the authentication server
     *
     * @property clientSecret
     * @type String
     * @default null
     * @public
     */
    apiClientSecret: ENV.api.clientSecret,

    /**
     * The client_secret to be sent to the authentication server
     *
     * @property clientSecret
     * @type String
     * @default null
     * @public
     */
    serverTokenEndpoint: ENV.api.host+'/api/v'+ENV.api.version+"/token",

    /**
     * Authenticates the session with the specified `identification`, `password`
     * and optional `scope`; issues a `POST` request to the
     *
     * @method authenticate
     * @param {String} identification The resource owner username
     * @param {String} password The resource owner password
     * @param {String|Array} scope The scope of the access request (see [RFC 6749, section 3.3](http://tools.ietf.org/html/rfc6749#section-3.3))
     * @param {Object} headers Optional headers that particular backends may require (for example sending 2FA challenge responses)
     * @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
     * @public
     */
    authenticate(identification, password, scope = [], headers = {}) {
        Logger.debug('in session authentication');
        return new RSVP.Promise((resolve, reject) => {
            const data                = { 'grant_type': 'password', username: identification, password,'client_id':this.apiClientId,'client_secret':this.apiClientSecret };
            const serverTokenEndpoint = this.serverTokenEndpoint;
            const useResponse = this.rejectWithResponse;
            const scopesString = makeArray(scope).join(' ');
            if (!isEmpty(scopesString)) {
                data.scope = scopesString;
            }
            this.makeRequest(serverTokenEndpoint, data, headers).then((response) => {
                run(() => {
                    if (!this._validate(response)) {
                        reject('access_token is missing in server response');
                    }

                    const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
                    this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
                    if (!isEmpty(expiresAt)) {
                        response = assign(response, { 'expires_at': expiresAt });
                    }

                    resolve(response);
                });
            }, (response) => {
                run(null, reject, useResponse ? response : response.responseJSON);
            });
        });
    },
});