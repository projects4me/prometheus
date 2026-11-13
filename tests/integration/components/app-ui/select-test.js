/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { clickTrigger, typeInSearch } from 'ember-power-select/test-support/helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { hbs } from 'ember-cli-htmlbars';

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

		assert.dom('[data-test-select]').hasClass('ember-power-select-trigger');
		assert.dom('[data-test-select]').includesText('Pick one');

		await clickTrigger('[data-test-wrap]');
		assert.dom('.ember-power-select-option [data-option]').exists({ count: 2 });

		await selectChoose('[data-test-wrap]', 'Beta');
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

		await clickTrigger('[data-test-wrap]');
		await typeInSearch('zzz');
		assert.dom('.ember-power-select-option--no-matches-message').hasText('Nothing here');
		await typeInSearch('');

		await selectChoose('[data-test-wrap]', 'Alpha');
		await selectChoose('[data-test-wrap]', 'Beta');
		assert.deepEqual(this.selected.map((option) => option.value), ['a', 'b']);
		assert.dom('.ember-power-select-multiple-option').exists({ count: 2 });
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
