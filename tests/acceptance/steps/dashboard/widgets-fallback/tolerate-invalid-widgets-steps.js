/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../../steps';
import { currentURL } from '@ember/test-helpers';

/**
 * #UNCOMMON steps for tolerate-invalid-widgets.feature only.
 * Do not add these to tests/acceptance/steps/steps.js — they load via
 * tests/acceptance/steps/dashboard/widgets-fallback/tolerate-invalid-widgets-steps.js (ember-cli-yadda).
 *
 * @module tests/acceptance/steps/dashboard/widgets-fallback/tolerate-invalid-widgets-steps
 */
export default function (assert) {
	return steps(assert)
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
		.then('Dashboard should render its widgets', async function () {
			assert.equal(currentURL(), '/app', 'User is on the dashboard');
			assert.ok(document.querySelector('section.content .box'), 'Dashboard widgets are rendered');
		});
}
