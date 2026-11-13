/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/*
 * Test helpers for AppUi::Select. This is the only test file that knows the select is built on ember-power-select
 * and ember-basic-dropdown: steps and integration tests call these helpers, so changing the select's internals
 * only changes this file.
 *
 * `scope` is a CSS selector or an element that contains the select (or is its trigger).
 */
import { find, findAll } from '@ember/test-helpers';
import { selectChoose, selectSearch, removeMultipleOption, clearSelected } from 'ember-power-select/test-support';
import { clickTrigger, typeInSearch } from 'ember-power-select/test-support/helpers';

const OPTION = '.ember-power-select-option';
const GROUP_NAME = '.ember-power-select-group-name';
const TRIGGER = '.ember-power-select-trigger';
const SELECTED_ITEM = '.ember-power-select-selected-item';
const MULTIPLE_OPTION = '.ember-power-select-multiple-option';
const NO_MATCHES = '.ember-power-select-option--no-matches-message';
const PLACEHOLDER = '.ember-power-select-placeholder';

const textOf = (el) => el.textContent.trim();

/** Opens the select. */
export function openSelect(scope) {
	return clickTrigger(scope);
}

/** Types into the select's search box (the select must be open or is opened). */
export function searchSelect(scope, text) {
	return selectSearch(scope, text);
}

/** Types into the search box of the select that is currently open. */
export function typeInSelectSearch(text) {
	return typeInSearch(text);
}

/** Picks the option whose text is `text`. */
export function chooseOption(scope, text) {
	return selectChoose(scope, text);
}

/** Picks the option at `index` (0-based) in the open list. */
export function chooseOptionAt(scope, index) {
	return selectChoose(scope, OPTION, index);
}

/** Removes a chosen option from a multiple select. */
export function removeSelectedOption(scope, text) {
	return removeMultipleOption(scope, text);
}

/** Clears the selection (the select must allow clearing). */
export function clearSelect(scope) {
	return clearSelected(scope);
}

/** Texts of the options in the open list. */
export function selectOptionTexts() {
	return findAll(OPTION).map(textOf);
}

/** The option elements in the open list. */
export function selectOptions() {
	return findAll(OPTION);
}

/** The first option in the open list whose text matches `matcher` (string or RegExp). */
export function findSelectOption(matcher) {
	const test = matcher instanceof RegExp ? (text) => matcher.test(text) : (text) => text === matcher;
	return findAll(OPTION).find((el) => test(textOf(el)));
}

/** Names of the option groups in the open list. */
export function selectGroupNames() {
	return findAll(GROUP_NAME).map(textOf);
}

/** The trigger element of the select inside `scope`. */
export function selectTrigger(scope) {
	return find(`${scopeSelector(scope)} ${TRIGGER}`);
}

/** CSS selector for the trigger of the select inside `scopeSelector`. */
export function triggerSelector(scopeSelector) {
	return `${scopeSelector} ${TRIGGER}`;
}

/** CSS selector for the selected item (single select) inside `scopeSelector`. */
export function selectedItemSelector(scopeSelector) {
	return `${scopeSelector} ${SELECTED_ITEM}`;
}

/** CSS selector for the chosen options (multiple select) inside `scopeSelector`. */
export function selectedOptionsSelector(scopeSelector) {
	return `${scopeSelector} ${MULTIPLE_OPTION}`;
}

/** CSS selector for the open list's options, optionally under `scopeSelector`. */
export function optionsSelector(scopeSelector = '') {
	return `${scopeSelector} ${OPTION}`.trim();
}

/** CSS selector for the "no matches" message of the open list. */
export function noMatchesSelector() {
	return NO_MATCHES;
}

/** CSS selector for the placeholder of the select inside `scopeSelector`. */
export function placeholderSelector(scopeSelector = '') {
	return `${scopeSelector} ${PLACEHOLDER}`.trim();
}

/** Whether the select inside `scope` is open. */
export function isSelectOpen(scope) {
	return selectTrigger(scope)?.getAttribute('aria-expanded') === 'true';
}

/** Texts of the chosen options of a multiple select inside `scopeSelector`. */
export function selectedOptionTexts(scopeSelector) {
	return findAll(selectedOptionsSelector(scopeSelector)).map((el) => textOf(el).replace('×', '').trim());
}

function scopeSelector(scope) {
	if (typeof scope !== 'string') {
		throw new Error('selectTrigger needs a CSS selector scope');
	}
	return scope;
}
