/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import { currentSession } from 'prometheus/tests/helpers/session';
import { click, currentURL, fillIn, settled, visit } from '@ember/test-helpers';

const SIGN_IN_EMAIL = 'auth-flows@test.local';
const SIGN_IN_PASSWORD = 'valid-password';

/**
 * #UNCOMMON steps for auth-flows.feature only. Loaded through ember-cli-yadda
 * from tests/acceptance/steps/app/auth-flows-steps.js, not from steps.js.
 *
 * @module tests/acceptance/steps/app/auth-flows-steps
 */
export default function (assert) {
	let deepLink = null; // eslint-disable-line no-unused-vars

	return steps(assert)
		.when('User signs in through the form with valid credentials', async function () {
			let user = server.schema.users.find(1);
			user.update({ email: SIGN_IN_EMAIL, accountStatus: 'active' });
			// Mirage serves `user/me` from the shared context, as the logged-in step does.
			server.schema.userpermissions.all().models.forEach((permission) => {
				permission.update({ userId: user.id, allowed: '1' });
			});
			user.update({ aclPermissions: server.schema.userpermissions.all() });
			new Context().set('currentUser', user);
			await fillIn('input#email', SIGN_IN_EMAIL);
			await fillIn('input#password', SIGN_IN_PASSWORD);
			await click('[data-signin-submit]');
			await settled();
			assert.ok(true, 'User submitted the sign-in form');
		})
		.when('Signed out user visits a project deep link', async function () {
			let project = server.schema.projects.first() || server.create('project');
			deepLink = `/app/project/${project.shortCode}`;
			await visit(deepLink);
			assert.ok(true, `User visited ${deepLink}`);
		})
		.when('Signed in user visits the signin route', async function () {
			await visit('/signin');
			assert.ok(true, 'User visited /signin');
		})
		.then('User lands on the app route', async function () {
			assert.ok(
				currentURL() === '/app' || currentURL().startsWith('/app/'),
				`User is in the app (${currentURL()})`
			);
		})
		.then('User is sent to the signin route', async function () {
			assert.equal(currentURL(), '/signin', 'User is sent to /signin');
		})
		.then('The session is authenticated', async function () {
			assert.ok(currentSession().isAuthenticated, 'Session is authenticated');
		})
		.then('The session is not authenticated', async function () {
			assert.notOk(currentSession().isAuthenticated, 'Session is not authenticated');
		})
		.then('The session holds an access token, a refresh token and an expiry', async function () {
			let data = currentSession().get('data.authenticated');
			assert.ok(data.access_token, 'access_token is stored');
			assert.ok(data.refresh_token, 'refresh_token is stored');
			assert.ok(data.expires_at > Date.now(), 'expires_at is in the future');
		});
}
