/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, fillIn, settled } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

const QUALIFICATION_SECTION = '.user-qualification-section';
const TYPE_INDEX = {
	education: 0,
	certification: 1,
};

function queryQualificationFormButton(selector) {
	return document.querySelector(`${QUALIFICATION_SECTION} ${selector}`);
}

async function selectQualificationType(type) {
	const selectEl = document.querySelector(
		'[data-field="user-qualification.type"] > div.input-group'
	);
	await selectChoose(
		selectEl.querySelector('div'),
		'.ember-power-select-option',
		TYPE_INDEX[type]
	);
}

async function selectCompletionYear(year) {
	const selectEl = document.querySelector(
		'[data-field="user-qualification.completionYear"] > div.input-group'
	);
	await selectChoose(selectEl.querySelector('div'), String(year));
}

export default function (assert) {
	return steps(assert)
		.when('User clicks add qualification button', async function () {
			await click('[data-add="user.qualification"]');
			assert.ok(true, 'User clicked add qualification button');
		})
		.when('User opens qualification add form', async function () {
			await click('[data-add="user.qualification"]');
			assert.ok(true, 'User opened qualification add form');
		})
		.when('User selects "$type" as qualification type', async function (type) {
			await selectQualificationType(type);
			assert.ok(true, `User selected ${type} as qualification type`);
		})
		.when('User enters "$title" in qualification title field', async function (title) {
			await fillIn('[data-field="user-qualification.title"] input', title);
			assert.ok(true, `User entered ${title} in qualification title field`);
		})
		.when('User enters "$institution" in qualification institution field', async function (institution) {
			await fillIn('[data-field="user-qualification.institution"] input', institution);
			assert.ok(true, `User entered ${institution} in qualification institution field`);
		})
		.when('User selects completion year "$year"', async function (year) {
			await selectCompletionYear(year);
			assert.ok(true, `User selected completion year ${year}`);
		})
		.when(
			'User adds certification qualification with title "$title", institution "$institution", year "$year"',
			async function (title, institution, year) {
				await click('[data-add="user.qualification"]');
				await selectQualificationType('certification');
				await fillIn('[data-field="user-qualification.title"] input', title);
				await fillIn('[data-field="user-qualification.institution"] input', institution);
				await selectCompletionYear(year);
				await click(queryQualificationFormButton('[data-btn="save"]'));
				await settled();
				assert.ok(
					true,
					`User added certification ${title} from ${institution} (${year})`
				);
			}
		)
		.when('User saves qualification form', async function () {
			await click(queryQualificationFormButton('[data-btn="save"]'));
			await settled();
			assert.ok(true, 'User saved qualification form');
		})
		.when('User saves qualification form without filling fields', async function () {
			await click(queryQualificationFormButton('[data-btn="save"]'));
			await settled();
			assert.ok(true, 'User saved qualification form without filling fields');
		})
		.when('User cancels qualification form', async function () {
			await click(queryQualificationFormButton('[data-btn="close"]'));
			await settled();
			assert.ok(true, 'User cancelled qualification form');
		})
		.then('User qualification title is "$title"', function (title) {
			assert
				.dom(`${QUALIFICATION_SECTION} .qualification-title`)
				.hasText(title, `User qualification title is ${title}`);
		})
		.then('User qualification institution is "$institution"', function (institution) {
			assert
				.dom(`${QUALIFICATION_SECTION} .qualification-institution`)
				.hasText(institution, `User qualification institution is ${institution}`);
		})
		.then('User qualification year is "$year"', function (year) {
			assert
				.dom(`${QUALIFICATION_SECTION} .qualification-year`)
				.hasText(year, `User qualification year is ${year}`);
		})
		.then('User qualification type icon is "$type"', function (type) {
			assert
				.dom(`${QUALIFICATION_SECTION} .qualification-type-icon-${type}`)
				.exists(`User qualification type icon is ${type}`);
		})
		.then('User sees qualification required fields messenger error', function () {
			const errorMessage = document.querySelector(
				'.messenger-message.message-error .messenger-message-inner'
			);
			assert.ok(errorMessage, 'Messenger error message should be displayed');
			assert.ok(
				errorMessage.textContent.includes('required'),
				'Messenger error should describe required qualification fields'
			);
			assert.notOk(
				document.querySelector('[data-field="user-qualification.type"] span.error'),
				'Inline type field error should not be shown on save'
			);
			assert.notOk(
				document.querySelector('[data-field="user-qualification.title"] span.error'),
				'Inline title field error should not be shown on save'
			);
		})
		.then('Qualification add form is not visible', function () {
			assert.notOk(
				document.querySelector('[data-user-qualification-form]'),
				'Qualification add form is not visible'
			);
		})
		.then('User qualification list is empty', function () {
			const items = document.querySelectorAll(
				`${QUALIFICATION_SECTION} [data-qualification-item]`
			);
			assert.equal(items.length, 0, 'User qualification list is empty');
		});
}
