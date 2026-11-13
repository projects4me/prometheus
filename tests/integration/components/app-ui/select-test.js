/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { chooseOption, noMatchesSelector, openSelect, optionsSelector, selectedOptionsSelector, triggerSelector, typeInSelectSearch } from 'prometheus/tests/helpers/select';

const OPTIONS = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Beta' },
];

module('Integration | Component | app-ui/select', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders the options through its block and reports the choice', async function (assert) {
		this.set('options', OPTIONS);
		this.set('selected', null);
		this.set('change', (option) => this.set('selected', option));
		await render(hbs`
			<div data-test-wrap><AppUi::Select
				@options={{this.options}}
				@selected={{this.selected}}
				@onChange={{this.change}}
				@placeholder="Pick one"
				data-test-select
				as |option|
			>
				<span data-option={{option.value}}>{{option.label}}</span>
			</AppUi::Select></div>
		`);

		assert.dom(triggerSelector('[data-test-wrap]')).exists();
		assert.dom('[data-test-select]').includesText('Pick one');

		await openSelect('[data-test-wrap]');
		assert.dom(`${optionsSelector()} [data-option]`).exists({ count: 2 });

		await chooseOption('[data-test-wrap]', 'Beta');
		assert.strictEqual(this.selected.value, 'b');
		assert.dom('[data-test-select] [data-option="b"]').exists();
	});

	test('it searches on searchField, shows the no-matches message and supports multiple', async function (assert) {
		this.set('options', OPTIONS);
		this.set('selected', []);
		this.set('change', (options) => this.set('selected', options));
		await render(hbs`
			<div data-test-wrap><AppUi::Select
				@multiple={{true}}
				@options={{this.options}}
				@selected={{this.selected}}
				@onChange={{this.change}}
				@searchEnabled={{true}}
				@searchField="label"
				@noMatchesMessage="Nothing here"
				data-test-select
				as |option|
			>
				{{option.label}}
			</AppUi::Select></div>
		`);

		await openSelect('[data-test-wrap]');
		await typeInSelectSearch('zzz');
		assert.dom(noMatchesSelector()).hasText('Nothing here');
		await typeInSelectSearch('');

		await chooseOption('[data-test-wrap]', 'Alpha');
		await chooseOption('[data-test-wrap]', 'Beta');
		assert.deepEqual(this.selected.map((option) => option.value), ['a', 'b']);
		assert.dom(selectedOptionsSelector('[data-test-wrap]')).exists({ count: 2 });
	});

	test('it is disabled when asked', async function (assert) {
		this.set('options', OPTIONS);
		this.set('noop', () => {});
		await render(hbs`
			<div data-test-wrap><AppUi::Select
				@options={{this.options}}
				@onChange={{this.noop}}
				@disabled={{true}}
				data-test-select
				as |option|
			>
				{{option.label}}
			</AppUi::Select></div>
		`);
		assert.dom('[data-test-select]').hasAttribute('aria-disabled', 'true');
	});
});
