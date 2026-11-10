import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quick-list/toolbar', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.groupOptions = [
			{ key: '', label: 'None' },
			{ key: 'status', label: 'Status' },
		];
		this.sortOptions = [
			{ key: 'title', label: 'Title' },
			{ key: 'date', label: 'Date' },
		];
		this.groupBy = 'status';
		this.sort = 'title';
		this.order = 'asc';
		this.onGroup = () => {};
		this.onSort = () => {};
	});

	const template = hbs`<QuickList::Toolbar
		@groupOptions={{this.groupOptions}} @groupBy={{this.groupBy}} @onGroup={{this.onGroup}}
		@sortOptions={{this.sortOptions}} @sort={{this.sort}} @order={{this.order}} @onSort={{this.onSort}}>
		<:start><span data-test-start>all</span></:start>
	</QuickList::Toolbar>`;

	test('it renders both menus with current labels', async function (assert) {
		await render(template);
		assert.dom('.quick-list-toolbar-group .fa-object-group').exists();
		assert.dom('.quick-list-toolbar-group .app-dropdown-btn').includesText('Status');
		assert.dom('.quick-list-toolbar-sort .fa-sort-amount-asc').exists();
		assert.dom('.quick-list-toolbar-sort .app-dropdown-btn').includesText('Title');
	});

	test('it renders the start block', async function (assert) {
		await render(template);
		assert.dom('[data-test-start]').hasText('all');
	});

	test('group menu marks the current choice and calls onGroup', async function (assert) {
		assert.expect(3);
		this.onGroup = (key) => assert.strictEqual(key, '');
		await render(template);
		await click('.quick-list-toolbar-group .app-dropdown-btn');
		assert.dom('[data-test-group-option="status"]').hasClass('is-current');
		assert.dom('[data-test-group-option="status"] .fa-check').exists();
		await click('[data-test-group-option=""]');
	});

	test('sort menu marks current and picking it again flips order', async function (assert) {
		const calls = [];
		this.onSort = (k, o) => calls.push([k, o]);
		await render(template);
		await click('.quick-list-toolbar-sort .app-dropdown-btn');
		assert.dom('[data-test-sort-option="title"]').hasClass('is-current');
		assert.dom('[data-test-sort-option="title"] .fa-sort-amount-asc').exists();
		await click('[data-test-sort-option="title"]');
		await click('[data-test-sort-option="date"]');
		assert.deepEqual(calls, [['title', 'desc'], ['date', 'asc']]);
	});

	test('desc order shows the desc icon', async function (assert) {
		this.order = 'desc';
		await render(template);
		assert.dom('.quick-list-toolbar-sort .fa-sort-amount-desc').exists();
	});

	test('menus are hidden without options', async function (assert) {
		this.groupOptions = [];
		this.sortOptions = [];
		await render(template);
		assert.dom('.quick-list-toolbar-group').doesNotExist();
		assert.dom('.quick-list-toolbar-sort').doesNotExist();
	});
	for (const menu of ['group', 'sort']) {
		test(`the current ${menu} option is white on hover and focus, crimson at rest`, async function (assert) {
			await render(template);
			await click(`.quick-list-toolbar-${menu} .app-dropdown-btn`);
			const item = this.element.querySelector(`[data-test-${menu}-option].is-current`);
			const rest = getComputedStyle(item).color;
			assert.notStrictEqual(rest, 'rgb(255, 255, 255)', 'marker colour at rest');
			item.focus();
			assert.strictEqual(getComputedStyle(item).color, 'rgb(255, 255, 255)', 'white when focused');
			assert.strictEqual(getComputedStyle(item.querySelector('i')).color, 'rgb(255, 255, 255)', 'icon is white when focused');
		});
	}

	test('the toolbar stays inside a narrow box and wraps its menus', async function (assert) {
		this.groupOptions = [{ key: 'long', label: 'A very long group option label that cannot fit' }];
		this.groupBy = 'long';
		await render(hbs`<div class="narrow-box" style="width: 160px"><QuickList::Toolbar
			@groupOptions={{this.groupOptions}} @groupBy={{this.groupBy}}
			@sortOptions={{this.sortOptions}} @sort={{this.sort}} @order={{this.order}}
			@onGroup={{this.onGroup}} @onSort={{this.onSort}} /></div>`);
		const box = this.element.querySelector('.narrow-box').getBoundingClientRect();
		const toolbar = this.element.querySelector('.quick-list-toolbar');
		assert.strictEqual(getComputedStyle(toolbar).flexWrap, 'wrap');
		for (const btn of this.element.querySelectorAll('.app-dropdown-btn')) {
			assert.true(btn.getBoundingClientRect().right <= box.right + 1, 'button stays inside the box');
		}
	});
});
