/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import EmberObject from '@ember/object';
import ENV from 'prometheus/config/environment';
import { isEmpty } from '@ember/utils';
import Logger from 'js-logger';
import { logAuthEvent } from 'prometheus/utils/auth/auth-log';

/**
 * OAuth2 password-grant authenticator, used through
 * `session.authenticate('authenticator:oauth2', email, password)`. It only
 * exchanges credentials for tokens and validates restored data; token refresh is
 * owned by `services/session.js` (`ensureFreshToken`), never by the authenticator.
 *
 * @class OAuth2Authenticator
 * @namespace Prometheus.Authenticators
 * @extends EmberObject
 * @author Hammad Hassan gollomer@gmail.com
 */
export default class OAuth2Authenticator extends EmberObject {
    /**
     * The client_id sent to the authentication server.
     *
     * @property apiClientId
     * @type String
     * @public
     */
    apiClientId = ENV.api.clientId;

    /**
     * The client_secret sent to the authentication server.
     *
     * @property apiClientSecret
     * @type String
     * @public
     */
    apiClientSecret = ENV.api.clientSecret;

    /**
     * The token endpoint.
     *
     * @property serverTokenEndpoint
     * @type String
     * @public
     */
    serverTokenEndpoint = ENV.api.host + '/api/v' + ENV.api.version + '/token';

    /**
     * Refreshing is done by services/session.js only (see restore).
     *
     * @property refreshAccessTokens
     * @type Boolean
     * @default false
     * @public
     */
    refreshAccessTokens = false;

    /**
     * When true, a failed sign-in rejects with the whole response instead of
     * its `responseJSON`.
     *
     * @property rejectWithResponse
     * @type Boolean
     * @default false
     * @public
     */
    rejectWithResponse = false;

    /**
     * Authenticates with the given email, password and optional scope by POSTing
     * a password grant to the token endpoint.
     *
     * @method authenticate
     * @param {String} identification The resource owner email
     * @param {String} password The resource owner password
     * @param {String|Array} scope The scope of the access request
     * @param {Object} headers Optional extra request headers
     * @return {Promise<Object>} The token response, with `expires_at` added
     * @public
     */
    async authenticate(identification, password, scope = [], headers = {}) {
        Logger.debug('in session authentication');
        const data = {
            grant_type: 'password',
            email: identification,
            password,
            client_id: this.apiClientId,
            client_secret: this.apiClientSecret,
            remember_me: localStorage.getItem('remember_me'),
        };
        const scopesString = [].concat(scope).join(' ');

        if (!isEmpty(scopesString)) {
            data.scope = scopesString;
        }

        let response;

        try {
            response = await this.makeRequest(this.serverTokenEndpoint, data, headers);
        } catch (failure) {
            logAuthEvent('sign-in failed', {
                error: failure?.responseJSON?.error || failure?.status || 'unknown',
            });
            throw this.rejectWithResponse ? failure : failure?.responseJSON;
        }

        if (!this._validate(response)) {
            logAuthEvent('sign-in failed', { error: 'access_token missing' });
            throw 'access_token is missing in server response';
        }

        const expiresAt = this._absolutizeExpirationTime(response.expires_in);

        if (!isEmpty(expiresAt)) {
            response = Object.assign(response, { expires_at: expiresAt });
        }

        return response;
    }

    /**
     * Restores the session data as is. Token refresh is owned by `services/session.js`
     * (`ensureFreshToken`), which coordinates tabs with a lock. The authenticator must not
     * schedule or perform its own refresh, because tabs would race and Gaia rotates the
     * refresh token. An expired access token is resolved too, so that it is refreshed under
     * the lock instead of logging the user out.
     *
     * @method restore
     * @param {Object} data The persisted session data
     * @return {Promise<Object>} Resolves with the data when it holds an access token
     * @public
     */
    restore(data) {
        if (this._validate(data)) {
            logAuthEvent('session restored');
            return Promise.resolve(data);
        }

        logAuthEvent('restore rejected');
        return Promise.reject();
    }

    /**
     * Nothing to revoke on the server; the session clears its data.
     *
     * @method invalidate
     * @return {Promise<void>}
     * @public
     */
    invalidate() {
        return Promise.resolve();
    }

    /**
     * POSTs form-encoded data. Resolves with the JSON body; rejects with the
     * fetch Response carrying `responseJSON` (or `responseText` when the body is
     * not JSON), as the sign-in controller expects.
     *
     * @method makeRequest
     * @param {String} url
     * @param {Object} data
     * @param {Object} [headers]
     * @return {Promise<Object>}
     * @public
     */
    async makeRequest(url, data, headers = {}) {
        const body = Object.keys(data)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
        const response = await fetch(url, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const text = await response.text();
        let json;

        try {
            json = JSON.parse(text);
        } catch (e) {
            response.responseText = text;
            throw response;
        }

        if (!response.ok) {
            response.responseJSON = json;
            throw response;
        }

        return json;
    }

    /** The authenticator never schedules a refresh (see restore). */
    _scheduleAccessTokenRefresh() {}

    _absolutizeExpirationTime(expiresIn) {
        if (!isEmpty(expiresIn)) {
            return new Date(new Date().getTime() + expiresIn * 1000).getTime();
        }

        return undefined;
    }

    _validate(data) {
        return !isEmpty(data?.access_token);
    }
}
