/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../../steps';
import { currentURL } from '@ember/test-helpers';
import { Response } from 'miragejs';

// the models of the widgets' first loads and of the issue statuses
const FIRST_LOAD_MODELS = ['issuestatus', 'issue', 'milestone', 'activity', 'comment'];

/**
 * #UNCOMMON steps for tolerate-invalid-widgets.feature only.
 * Do not add these to tests/acceptance/steps/steps.js — they load via
 * tests/acceptance/steps/dashboard/widgets-fallback/tolerate-invalid-widgets-steps.js (ember-cli-yadda).
 *
 * @module tests/acceptance/steps/dashboard/widgets-fallback/tolerate-invalid-widgets-steps
 */
export default function (assert) {
	let sent = [];

	return steps(assert)
		.given('The dashboard load requests are recorded', async function () {
			sent = [];
			server.pretender.handledRequest = (verb, path, request) => {
				sent.push({ verb, path: path.split('?')[0], body: request.requestBody });
			};
			assert.ok(true, 'requests are recorded');
		})
		.given('The activities are forbidden to the user', async function () {
			server.get('/activity', () => new Response(403, {}, { errors: 'Access denied to activity' }));
			assert.ok(true, 'activities answer 403');
		})
		.given('User $userId dashboard widgets are "$widgets"', async function (userId, widgets) {
			let user = server.schema.users.find(parseInt(userId, 10));
			user.dashboard.update({ widgets });
			assert.ok(true, `User ${userId} dashboard widgets set to "${widgets}"`);
		})
		.given('User $userId has an empty dashboard widget list', async function (userId) {
			let user = server.schema.users.find(parseInt(userId, 10));
			user.dashboard.update({ widgets: '' });
			assert.equal(user.dashboard.widgets, '', `User ${userId} has an empty dashboard widget list`);
		})
		.given('User $userId has no dashboard', async function (userId) {
			let user = server.schema.users.find(parseInt(userId, 10));
			user.update({ dashboard: null });
			assert.notOk(user.dashboard, `User ${userId} has no dashboard`);
		})
		.then('One bulk request loaded the items "$ids"', async function (ids) {
			let expected = ids.split(',').map((id) => id.trim());
			let batches = sent
				.filter((request) => request.verb === 'POST' && request.path.endsWith('/bulk'))
				.map((request) => JSON.parse(request.body).requests.map((item) => item.id))
				.filter((items) => items.includes('system-issuestatuses'));
			assert.strictEqual(batches.length, 1, 'one bulk request carries the dashboard load');
			assert.deepEqual(batches[0], expected, `the batch holds ${ids}`);
		})
		.then('No widget loaded its first page with its own request', async function () {
			let separate = sent.filter((request) => request.verb === 'GET'
				&& FIRST_LOAD_MODELS.some((model) => request.path.endsWith(`/${model}`)));
			assert.deepEqual(separate.map((request) => request.path), [], 'no separate first-load requests');
		})
		.then('The dashboard shows $count widgets', async function (count) {
			assert.strictEqual(document.querySelectorAll('[data-widgets] .widget').length, parseInt(count, 10), `${count} widgets are shown`);
			assert.ok(document.querySelector('[data-weekly-activities]'), 'the widget whose load failed is still shown');
		})
		.then('Dashboard should render its widgets', async function () {
			assert.equal(currentURL(), '/app', 'User is on the dashboard');
			assert.ok(document.querySelector('section.content .box'), 'Dashboard widgets are rendered');
		});
}
