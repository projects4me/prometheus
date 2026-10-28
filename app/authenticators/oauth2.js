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
import { inject } from '@ember/service';

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
    serverTokenEndpoint: ENV.api.host + '/api/v' + ENV.api.version + "/token",

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Ember.Service
     * @for OAuth2PasswordGrant
     * @public
     */
    session: inject(),

    /**
     * Refreshing is done by services/session.js only (see restore).
     *
     * @property refreshAccessTokens
     * @type Boolean
     * @default false
     * @public
     */
    refreshAccessTokens: false,

    /**
     * Authenticates the session with the specified `identification`, `password`
     * and optional `scope`; issues a `POST` request to the
     *
     * @method authenticate
     * @param {String} email The resource owner email
     * @param {String} password The resource owner password
     * @param {String|Array} scope The scope of the access request (see [RFC 6749, section 3.3](http://tools.ietf.org/html/rfc6749#section-3.3))
     * @param {Object} headers Optional headers that particular backends may require (for example sending 2FA challenge responses)
     * @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
     * @public
     */
    authenticate(identification, password, scope = [], headers = {}) {
        Logger.debug('in session authentication');
        return new RSVP.Promise((resolve, reject) => {
            const data = { 'grant_type': 'password', email: identification, password, 'client_id': this.apiClientId, 'client_secret': this.apiClientSecret, remember_me: localStorage.getItem('remember_me') };
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

    /**
     * Restores the session data as is. Token refresh is owned by `services/session.js`
     * (`ensureFreshToken`), which coordinates tabs with a lock. The authenticator must not
     * schedule or perform its own refresh, because tabs would race and Gaia rotates the
     * refresh token. An expired access token is resolved too, so that it is refreshed under
     * the lock instead of logging the user out.
     *
     * @method restore
     * @param {Object} data The persisted session data
     * @return {Ember.RSVP.Promise} Resolves with the data when it holds an access token
     * @public
     */
    restore(data) {
        return new RSVP.Promise((resolve, reject) => {
            if (this._validate(data)) {
                resolve(data);
            } else {
                reject();
            }
        });
    }
});
