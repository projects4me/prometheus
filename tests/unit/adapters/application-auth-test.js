/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import ENV from 'prometheus/config/environment';
import {
	authenticateSession,
	currentSession
} from 'prometheus/tests/helpers/session';

const API = `${ENV.api.host}/api/v${ENV.api.version}`;

module('Unit | Adapter | application | token refresh', function (hooks) {
	setupTest(hooks);
	setupMirage(hooks);

	hooks.beforeEach(function () {
		this.tokenGrants = [];
		this.pingTokens = [];

		this.server.post('/token', (schema, request) => {
			let params = new URLSearchParams(request.requestBody);
			this.tokenGrants.push(params.get('grant_type'));

			if (this.refreshStatus && this.refreshStatus !== 200) {
				return new Response(this.refreshStatus, {}, { error: 'invalid_grant' });
			}

			return {
				access_token: 'access-new',
				refresh_token: 'refresh-new',
				expires_in: 3600,
				token_type: 'Bearer',
				scope: 'user'
			};
		});

		this.server.get('/ping', (schema, request) => {
			let token = (request.requestHeaders.Authorization || '').replace('Bearer ', '');
			this.pingTokens.push(token);

			if (this.rejectToken && token === this.rejectToken) {
				return new Response(401, {}, { error: 'invalid_token' });
			}

			return { ok: true };
		});
	});

	function session(overrides = {}) {
		return {
			authenticator: 'authenticator:oauth2',
			access_token: 'access-old',
			refresh_token: 'refresh-old',
			expires_at: Date.now() + 3600 * 1000,
			...overrides
		};
	}

	test('an expired access token is refreshed once before the request, which carries the new token', async function (assert) {
		await authenticateSession(session({ expires_at: Date.now() - 1000 }));
		let adapter = this.owner.lookup('adapter:application');

		await adapter.ajax(`${API}/ping`, 'GET');

		assert.deepEqual(this.tokenGrants, ['refresh_token'], 'one refresh_token POST');
		assert.deepEqual(this.pingTokens, ['access-new'], 'request sent with the new token');
		assert.strictEqual(
			currentSession().get('data.authenticated.access_token'),
			'access-new',
			'session holds the new token'
		);
	});

	test('a fresh access token is used as is', async function (assert) {
		await authenticateSession(session());
		let adapter = this.owner.lookup('adapter:application');

		await adapter.ajax(`${API}/ping`, 'GET');

		assert.deepEqual(this.tokenGrants, [], 'no refresh');
		assert.deepEqual(this.pingTokens, ['access-old'], 'request sent with the current token');
	});

	test('a 401 forces a refresh and the request is retried once', async function (assert) {
		await authenticateSession(session());
		this.rejectToken = 'access-old';
		let adapter = this.owner.lookup('adapter:application');

		await adapter.ajax(`${API}/ping`, 'GET');

		assert.deepEqual(this.tokenGrants, ['refresh_token'], 'one forced refresh');
		assert.deepEqual(this.pingTokens, ['access-old', 'access-new'], 'retried once with the new token');
	});

	test('a 401 that persists after the refresh is not retried again', async function (assert) {
		await authenticateSession(session());
		this.rejectToken = 'access-old';
		this.server.post('/token', (schema, request) => {
			this.tokenGrants.push(new URLSearchParams(request.requestBody).get('grant_type'));
			return { access_token: 'access-old', refresh_token: 'refresh-new', expires_in: 3600 };
		});
		let adapter = this.owner.lookup('adapter:application');

		await assert.rejects(adapter.ajax(`${API}/ping`, 'GET'), 'the second 401 is surfaced');
		assert.strictEqual(this.pingTokens.length, 2, 'exactly one retry');
	});

	test('a failed refresh invalidates the session', async function (assert) {
		await authenticateSession(session({ expires_at: Date.now() - 1000 }));
		this.refreshStatus = 400;
		let adapter = this.owner.lookup('adapter:application');

		await assert.rejects(adapter.ajax(`${API}/ping`, 'GET'), 'the request fails');
		assert.deepEqual(this.tokenGrants, ['refresh_token'], 'refresh was attempted');
		assert.notOk(currentSession().isAuthenticated, 'session is invalidated');
	});
});
