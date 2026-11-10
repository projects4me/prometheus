/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import Context from '../../../../mirage/yadda-context/context';
import { currentSession } from 'prometheus/tests/helpers/session';
import ENV from 'prometheus/config/environment';
import { click, currentURL, fillIn, settled, visit } from '@ember/test-helpers';

/**
 * #UNCOMMON steps for auth-flows.feature only. Loaded through ember-cli-yadda
 * from tests/acceptance/steps/app/auth-flows-steps.js, not from steps.js.
 *
 * @module tests/acceptance/steps/app/auth-flows-steps
 */
export default function (assert) {
	let deepLink = null;
	let invalidationTargets = [];

	return steps(assert)
		.given('User $userId has an active account with email $email', async function (userId, email) {
			let user = server.schema.users.find(parseInt(userId, 10));
			user.update({ email, accountStatus: 'active' });
			// Mirage serves `user/me` from the shared context, as the logged-in step does.
			server.schema.userpermissions.all().models.forEach((permission) => {
				permission.update({ userId: user.id, allowed: '1' });
			});
			user.update({ aclPermissions: server.schema.userpermissions.all() });
			new Context().set('currentUser', user);
			assert.equal(user.email, email, `User ${userId} has an active account for ${email}`);
		})
		.when('User signs in through the form with email $email and password $password', async function (email, password) {
			await fillIn('input#email', email);
			await fillIn('input#password', password);
			await click('[data-signin-submit]');
			await settled();
			assert.ok(true, `User submitted the sign-in form as ${email}`);
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
		.given('Sign-out reloads are recorded', async function () {
			// The tests skip the real reload, so record the calls to handleInvalidation instead.
			invalidationTargets = [];
			let session = currentSession();
			let original = session.handleInvalidation.bind(session);
			session.handleInvalidation = (target) => {
				invalidationTargets.push(target);
				return original(target);
			};
			assert.ok(true, 'handleInvalidation is recorded');
		})
		.then('User lands on the project deep link', async function () {
			assert.equal(currentURL(), deepLink, `User is back on ${deepLink}`);
		})
		.then('The app is reloaded at the root URL', async function () {
			assert.deepEqual(invalidationTargets, [ENV.rootURL], 'handleInvalidation was called with rootURL');
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
