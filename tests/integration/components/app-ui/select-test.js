/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor } from '@ember/test-helpers';
import AclStub from '../../stub-services/acl-stub';
import { hbs } from 'ember-cli-htmlbars';
import { chooseOption, noMatchesSelector, openSelect, optionsSelector, selectOptions, selectedOptionsSelector, triggerSelector, typeInSelectSearch } from 'prometheus/tests/helpers/select';

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

	test('it puts dropdownClass on the option list', async function (assert) {
		this.set('options', OPTIONS);
		this.set('noop', () => {});
		await render(hbs`
			<div data-test-wrap><AppUi::Select
				@options={{this.options}}
				@onChange={{this.noop}}
				@dropdownClass="test-dropdown"
				as |option|
			>
				<span data-option={{option.value}}>{{option.label}}</span>
			</AppUi::Select></div>
		`);

		await openSelect('[data-test-wrap]');
		assert.dom('.test-dropdown [data-option]').exists({ count: 2 }, 'the options render inside the classed dropdown');
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
	test('inside an open AppUi::Modal the list is drawn in the dialog and can be picked', async function (assert) {
		this.owner.register('service:acl', AclStub);
		this.set('options', OPTIONS);
		this.set('selected', null);
		this.set('change', (option) => this.set('selected', option));
		this.set('noop', () => {});
		await render(hbs`
			<AppUi::Modal @title="global.form.close" @closeLabel="global.form.close" @onClose={{this.noop}}>
				<div data-test-wrap><AppUi::Select
					@options={{this.options}}
					@selected={{this.selected}}
					@onChange={{this.change}}
					data-test-select
					as |option|
				>
					<span data-option={{option.value}}>{{option.label}}</span>
				</AppUi::Select></div>
			</AppUi::Modal>
		`);
		await waitFor('dialog.app-modal[open]');

		await openSelect('[data-test-wrap]');
		let options = selectOptions();
		assert.strictEqual(options.length, 2);
		assert.ok(options.every((option) => option.closest('dialog.app-modal[open]')), 'the list is inside the open dialog');
		let rect = options[0].getBoundingClientRect();
		assert.ok(rect.width > 0, 'the options have a width');
		assert.ok(rect.height > 0, 'the options have a height');

		await chooseOption('[data-test-wrap]', 'Beta');
		assert.strictEqual(this.selected.value, 'b');
		assert.dom('[data-test-select] [data-option="b"]').exists();
	});

	test('outside a dialog the list is drawn at the document root, as before', async function (assert) {
		this.set('options', OPTIONS);
		this.set('change', () => {});
		await render(hbs`
			<div data-test-wrap><AppUi::Select @options={{this.options}} @onChange={{this.change}} as |option|>
				{{option.label}}
			</AppUi::Select></div>
		`);

		await openSelect('[data-test-wrap]');
		let options = selectOptions();
		assert.strictEqual(options.length, 2);
		assert.notOk(options[0].closest('dialog'), 'not in a dialog');
		assert.notOk(options[0].closest('[data-test-wrap]'), 'not next to the trigger');
	});

	test("the caller's onOpen still runs and can keep the list closed inside a dialog", async function (assert) {
		this.owner.register('service:acl', AclStub);
		this.set('options', OPTIONS);
		this.set('change', () => {});
		this.set('noop', () => {});
		this.opened = 0;
		this.set('onOpen', () => {
			this.opened++;
			return false;
		});
		await render(hbs`
			<AppUi::Modal @title="global.form.close" @closeLabel="global.form.close" @onClose={{this.noop}}>
				<div data-test-wrap><AppUi::Select @options={{this.options}} @onChange={{this.change}} @onOpen={{this.onOpen}} as |option|>
					{{option.label}}
				</AppUi::Select></div>
			</AppUi::Modal>
		`);
		await waitFor('dialog.app-modal[open]');

		await openSelect('[data-test-wrap]');
		assert.strictEqual(this.opened, 1);
		assert.strictEqual(selectOptions().length, 0);
	});
});
