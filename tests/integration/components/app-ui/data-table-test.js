import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import Selection from 'prometheus/utils/state/selection';

module('Integration | Component | app-ui/data-table', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.calls = [];
		this.onSort = (key) => this.calls.push(['sort', key]);
		this.onSelect = (id, checked) => this.calls.push(['select', id, checked]);
		this.columns = [
			{ key: 'name', label: 'Name', sortable: true, sortKey: 'Agent.name', class: 'name-cell' },
			{ key: 'models', label: 'Models' },
		];
		this.rows = [
			{ id: 1, name: 'Achilles', models: 'sonnet' },
			{ id: 2, name: 'Argus', models: 'opus' },
		];
		this.set('sort', 'Agent.name');
		this.set('order', 'asc');
	});

	test('it draws one header per column and one row per record with the values', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} />`);
		assert.dom('[data-test-data-table-header]').exists({ count: 2 });
		assert.dom('[data-test-data-table-header="name"]').includesText('Name');
		assert.dom('[data-test-data-table-row]').exists({ count: 2 });
		assert.dom('[data-test-data-table-row="2"] [data-test-data-table-cell="models"]').hasText('opus');
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-cell="name"]').hasClass('name-cell');
		assert.dom('[data-test-data-table-select]').doesNotExist();
	});

	test('the cell block draws the cells', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:cell as |record column|><b data-test-cell>{{column.key}}:{{get record column.key}}</b></:cell>
		</AppUi::DataTable>`);
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-cell="name"] [data-test-cell]').hasText('name:Achilles');
	});

	test('a cell component draws its column with the record', async function (assert) {
		this.owner.register(
			'component:test-name-cell',
			setComponentTemplate(hbs`<i data-test-cell-component>{{@record.name}}/{{@column.key}}</i>`, templateOnly()),
		);
		this.columns = [{ key: 'name', label: 'Name', cell: 'test-name-cell' }];
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:cell><b data-test-cell>block</b></:cell>
		</AppUi::DataTable>`);
		assert.dom('[data-test-cell]').doesNotExist('the cell component wins over the block');
		assert.dom('[data-test-data-table-row="1"] [data-test-cell-component]').hasText('Achilles/name');
	});

	test('sortable columns draw the sort state and report the sort key', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @sort={{this.sort}} @order={{this.order}} @onSort={{this.onSort}} />`);
		assert.dom('[data-test-data-table-sort]').exists({ count: 1 });
		assert.dom('[data-test-data-table-sort="name"] i').hasClass('fa-sort-asc');
		this.set('order', 'desc');
		assert.dom('[data-test-data-table-sort="name"] i').hasClass('fa-sort-desc');
		this.set('sort', 'Agent.modelConfig');
		assert.dom('[data-test-data-table-sort="name"] i').hasClass('fa-sort');
		await click('[data-test-data-table-sort="name"]');
		assert.deepEqual(this.calls, [['sort', 'Agent.name']]);
	});

	test('selectable rows report the id and the checked state', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @selectable={{true}} @onSelect={{this.onSelect}} />`);
		assert.dom('th.select-box').exists();
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-select]').hasAttribute('data-select', '1');
		await click('[data-test-data-table-row="1"] [data-test-data-table-select]');
		await click('[data-test-data-table-row="1"] [data-test-data-table-select]');
		assert.deepEqual(this.calls, [
			['select', '1', true],
			['select', '1', false],
		]);
	});

	test('row actions and the empty state come from blocks', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:rowActions as |record|><button type="button" data-test-edit={{record.id}}>Edit</button></:rowActions>
		</AppUi::DataTable>`);
		assert.dom('[data-test-data-table-row="2"] [data-test-data-table-actions] [data-test-edit="2"]').exists();

		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{null}}>
			<:empty><span data-test-nothing>Nothing</span></:empty>
		</AppUi::DataTable>`);
		assert.dom('[data-test-data-table-row]').doesNotExist();
		assert.dom('[data-test-data-table-empty] [data-test-nothing]').exists();
		assert.dom('[data-test-data-table-actions]').doesNotExist();
	});

	test('the sort icon shows on every sortable column and the applied one is marked', async function (assert) {
		this.columns = [
			{ key: 'name', label: 'Name', sortable: true },
			{ key: 'models', label: 'Models', sortable: true },
		];
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @sort="name" @order="asc" />`);
		assert.dom('[data-test-data-table-sort="models"] i').hasClass('fa-sort');
		assert.dom('[data-test-data-table-sort="models"]').doesNotHaveClass('active');
		assert.dom('[data-test-data-table-sort="name"]').hasClass('active');
	});

	test('the select-all box reports and the selection spans pages', async function (assert) {
		this.set('selectedIds', ['9']);
		this.onSelectAll = (rows, checked) => this.calls.push(['all', rows.length, checked]);
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @selectable={{true}} @selectedIds={{this.selectedIds}} @onSelectAll={{this.onSelectAll}} />`);
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'none');
		await click('[data-quick-list-select-all]');
		assert.deepEqual(this.calls, [['all', 2, true]]);
		this.set('selectedIds', ['9', '1', '2']);
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'all');
		assert.dom('[data-test-data-table-row="1"] input').isChecked();
	});

	test('a shared selection is kept across pages and reported', async function (assert) {
		this.selection = new Selection();
		this.changes = [];
		this.onSelectionChange = (ids) => this.changes.push(ids);
		this.set('page', this.rows);
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.page}} @selectable={{true}} @selection={{this.selection}} @onSelectionChange={{this.onSelectionChange}} />`);
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'none');
		await click('[data-test-data-table-row="1"] [data-test-data-table-select]');
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'some');

		this.set('page', [
			{ id: 3, name: 'Hector', models: 'haiku' },
			{ id: 4, name: 'Paris', models: 'sonnet' },
		]);
		assert.dom('[data-test-data-table-select]:checked').doesNotExist();
		await click('[data-quick-list-select-all]');
		assert.dom('[data-test-data-table-row="3"] input').isChecked();
		assert.dom('[data-test-data-table-row="4"] input').isChecked();

		this.set('page', this.rows);
		assert.dom('[data-test-data-table-row="1"] input').isChecked();
		assert.dom('[data-test-data-table-row="2"] input').isNotChecked();
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'some');
		assert.strictEqual(this.selection.count, 3);
		assert.deepEqual(this.changes, [['1'], ['1', '3', '4']]);

		await click('[data-test-data-table-row="1"] [data-test-data-table-select]');
		assert.false(this.selection.has(1));
		assert.deepEqual(this.selection.ids, ['3', '4']);
	});

	test('rows group by a key and a group collapses', async function (assert) {
		this.groupKey = (r) => r.models;
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @groupKey={{this.groupKey}} />`);
		assert.dom('[data-test-data-table-group]').exists({ count: 2 });
		await click('[data-test-data-table-group="opus"] [data-test-data-table-group-toggle]');
		assert.dom('[data-test-data-table-row="2"]').doesNotExist();
		assert.dom('[data-test-data-table-row="1"]').exists();
	});

	test('a second line and the more actions menu show', async function (assert) {
		this.columns = [{ key: 'name', label: 'Name', subKey: 'models' }];
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:moreActions as |record|><button type="button" data-test-more-item={{record.id}}>Del</button></:moreActions>
		</AppUi::DataTable>`);
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-sub="name"]').hasText('sonnet');
		assert.dom('[data-test-data-table-more-menu]').doesNotExist();
		await click('[data-test-data-table-row="1"] [data-test-data-table-more]');
		assert.dom('[data-test-more-item="1"]').exists();
	});
});
