/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

export const given = function () {
	return [
		{
			'Browser timezone is detected as $timezone': (assert, ctx) =>
				async function (timezone) {
					window.moment.tz.guess = function () {
						return timezone;
					};
					assert.ok(
						true,
						`Browser timezone is detected as ${timezone}`
					);
				}
		}
	];
};

export const when = function () {
	return [
		{
			'User accepts timezone change prompt': (assert) =>
				async function () {
					let confirmBtn = document.querySelector(
						'[data-action="confirm"] a'
					);
					await click(confirmBtn);
					assert.ok(
						true,
						'User clicked confirm button on timezone change prompt'
					);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'User should see timezone updated success message': (assert) =>
				async function () {
					// Check if success message is displayed
					let successMessage = document.querySelector(
						'.messenger-message.message-info'
					);
					if (successMessage) {
						assert.ok(true, 'Success message is displayed');
					} else {
						assert.ok(false, 'Success message is not displayed');
					}
					if (typeof Messenger !== 'undefined') {
						Messenger().hideAll();
					}
				}
		},
		{
			'User timezone should be updated to $timezone': (assert, ctx) =>
				async function (timezone) {
					let currentUser = ctx.get('currentUser');
					assert.equal(
						currentUser.timezone,
						timezone,
						`User timezone should be updated to ${timezone}`
					);
				}
		},
		{
			'User should not see timezone change prompt': (assert) =>
				async function () {
					let prompts = document.querySelectorAll(
						'.messenger-message.message-info'
					);
					let visiblePrompt = [...prompts].find(
						(el) => !el.classList.contains('messenger-hidden')
					);
					assert.ok(
						!visiblePrompt,
						'User should not see timezone change prompt'
					);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
