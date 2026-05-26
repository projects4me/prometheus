/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, fillIn, settled, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

const SKILL_SECTION = '.user-skills-section';
const PROFICIENCY_INDEX = {
	beginner: 0,
	intermediate: 1,
	advanced: 2,
	expert: 3,
};
function querySkillFormButton(selector) {
	return document.querySelector(`${SKILL_SECTION} ${selector}`);
}

async function selectSkillProficiency(level) {
	const selectEl = document.querySelector(
		'[data-field="user-skill.proficiencyLevel"] > div.input-group'
	);
	await selectChoose(
		selectEl.querySelector('div'),
		'.ember-power-select-option',
		PROFICIENCY_INDEX[level]
	);
}

export default function (assert) {
	return steps(assert)
		.given('User has skill "$name" with proficiency "$level"', async function (name, level) {
			server.create('userskill', {
				userId: '1',
				name,
				proficiencyLevel: level,
			});
			await visit('/app/user/1');
			await settled();
			assert.ok(true, `User has skill ${name} with proficiency ${level}`);
		})
		.when('User clicks add skill button', async function () {
			await click('[data-add="user.skills"]');
			assert.ok(true, 'User clicked add skill button');
		})
		.when('User opens skill add form', async function () {
			await click('[data-add="user.skills"]');
			assert.ok(true, 'User opened skill add form');
		})
		.when('User enters "$name" in skill name field', async function (name) {
			await fillIn('[data-field="user-skill.name"] input', name);
			assert.ok(true, `User entered ${name} in skill name field`);
		})
		.when('User selects "$level" as skill proficiency', async function (level) {
			await selectSkillProficiency(level);
			assert.ok(true, `User selected ${level} as skill proficiency`);
		})
		.when('User adds skill "$name" with proficiency "$level"', async function (name, level) {
			await click('[data-add="user.skills"]');
			await fillIn('[data-field="user-skill.name"] input', name);
			await selectSkillProficiency(level);
			await click(querySkillFormButton('[data-btn="save"]'));
			await settled();
			assert.ok(true, `User added skill ${name} with proficiency ${level}`);
		})
		.when('User saves skill form', async function () {
			await click(querySkillFormButton('[data-btn="save"]'));
			await settled();
			assert.ok(true, 'User saved skill form');
		})
		.when('User cancels skill form', async function () {
			await click(querySkillFormButton('[data-btn="close"]'));
			await settled();
			assert.ok(true, 'User cancelled skill form');
		})
		.then('User skill "$name" is displayed', function (name) {
			const chip = Array.from(
				document.querySelectorAll(`${SKILL_SECTION} .user-skill-chip-name`)
			).find((el) => el.textContent.trim() === name);
			assert.ok(chip, `User skill ${name} is displayed`);
		})
		.then('User skill "$name" has proficiency "$shortLabel"', function (name, shortLabel) {
			const chips = document.querySelectorAll(`${SKILL_SECTION} .user-skill-chip`);
			const chip = Array.from(chips).find((el) => {
				const nameEl = el.querySelector('.user-skill-chip-name');
				return nameEl?.textContent.trim() === name;
			});
			const levelEl = chip?.querySelector('.user-skill-chip-level');
			assert.equal(
				levelEl?.textContent.trim(),
				shortLabel,
				`User skill ${name} has proficiency ${shortLabel}`
			);
		})
		.then('User sees duplicate skill validation error', function () {
			assert.dom('[data-field="user-skill.name"] span.error').exists();
			assert
				.dom('[data-field="user-skill.name"] span.error')
				.includesText('already been added');
		})
		.then('Skill add form is not visible', function () {
			assert.notOk(
				document.querySelector('[data-user-skills-form]'),
				'Skill add form is not visible'
			);
		});
}
