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
import { cancel, later } from '@ember/runloop';
import { warn } from '@ember/debug';
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
            const data = { 'grant_type': 'password', username: identification, password, 'client_id': this.apiClientId, 'client_secret': this.apiClientSecret, remember_me: localStorage.getItem('remember_me') };
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

    /**
     * This method schedules refresh token API call according to the expiry time of the provided access token.
     * 
     * @method _scheduleAccessTokenRefresh
     * @param {Number} expiresIn 
     * @param {Date} expiresAt 
     * @param {String} refreshToken 
     */
    _scheduleAccessTokenRefresh(expiresIn, expiresAt, refreshToken) {
        const refreshAccessTokens = this.get('refreshAccessTokens');
        if (refreshAccessTokens) {
            const now = new Date().getTime();
            if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
                expiresAt = new Date(now + expiresIn * 1000).getTime();
            }
            const offset = this.get('tokenRefreshOffset');
            if (!isEmpty(refreshToken) && !isEmpty(expiresAt) && expiresAt > now - offset) {
                cancel(this._refreshTokenTimeout);
                delete this._refreshTokenTimeout;
                if (!(ENV.environment === 'test')) {
                    this._refreshTokenTimeout = later(
                        this,
                        this._refreshAccessToken,
                        expiresIn,
                        refreshToken,
                        expiresAt - now - offset
                    );
                }
            }
        }
    },

    /**
     * This method is scheduled by _scheduleAccessTokenRefresh method to make a call for grant type "refresh_token" to
     * the backend when the given access token is expired.
     * 
     * @method _refreshAccessToken
     * @param {Number} expiresIn 
     * @param {String} refreshToken 
     * @param {String} scope 
     * @returns {Promise}
     */
    _refreshAccessToken(expiresIn, refreshToken, scope) {
        const data = { grant_type: 'refresh_token', refresh_token: refreshToken, client_id: this.apiClientId, client_secret: this.apiClientSecret };
        const refreshAccessTokensWithScope = this.get('refreshAccessTokensWithScope');
        if (refreshAccessTokensWithScope && !isEmpty(scope)) {
            data.scope = scope;
        }
        let _self = this;
        const serverTokenEndpoint = this.get('serverTokenEndpoint');
        return new RSVP.Promise((resolve, reject) => {
            this.makeRequest(serverTokenEndpoint, data).then(
                response => {
                    run(() => {
                        expiresIn = response['expires_in'] || expiresIn;
                        refreshToken = response['refresh_token'] || refreshToken;
                        scope = response['scope'] || scope;
                        const expiresAt = this._absolutizeExpirationTime(expiresIn);
                        const data = Object.assign(response, {
                            expires_in: expiresIn,
                            expires_at: expiresAt,
                            refresh_token: refreshToken,
                        });
                        if (refreshAccessTokensWithScope && !isEmpty(scope)) {
                            data.scope = scope;
                        }
                        (this._scheduleAccessTokenRefresh(expiresIn, null, refreshToken));
                        this.trigger('sessionDataUpdated', data);
                        resolve(data);
                    });
                },
                response => {
                    warn(
                        `Access token could not be refreshed - server responded with ${response.responseJSON}.`,
                        false,
                        { id: 'ember-simple-auth.failedOAuth2TokenRefresh' }
                    );
                    reject();
                    localStorage.setItem('sessionExpired', true);
                    _self.session.invalidate();
                }
            )
        });
    },
});