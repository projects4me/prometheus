import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
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
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-select]').hasAttribute('aria-pressed', 'true');
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
		assert.dom('[data-test-data-table-select][aria-pressed="true"]').doesNotExist();
		await click('[data-quick-list-select-all]');
		assert.dom('[data-test-data-table-row="3"] [data-test-data-table-select]').hasAttribute('aria-pressed', 'true');
		assert.dom('[data-test-data-table-row="4"] [data-test-data-table-select]').hasAttribute('aria-pressed', 'true');

		this.set('page', this.rows);
		assert.dom('[data-test-data-table-row="1"] [data-test-data-table-select]').hasAttribute('aria-pressed', 'true');
		assert.dom('[data-test-data-table-row="2"] [data-test-data-table-select]').hasAttribute('aria-pressed', 'false');
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

	test('row check buttons use the QuickList icons and mark the selected row', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @selectable={{true}} />`);
		let btn = '[data-test-data-table-row="1"] [data-test-data-table-select]';
		assert.dom(btn).hasTagName('button').hasAttribute('aria-pressed', 'false');
		assert.dom(`${btn} i`).hasClass('fa-square-o');
		assert.dom('[data-test-data-table-row="1"]').doesNotHaveClass('data-table-row--selected');
		await click(btn);
		assert.dom(btn).hasAttribute('aria-pressed', 'true');
		assert.dom(`${btn} i`).hasClass('fa-check-square');
		assert.dom('[data-test-data-table-row="1"]').hasClass('data-table-row--selected');
		assert.dom('[data-test-data-table-row="2"]').doesNotHaveClass('data-table-row--selected');
	});

	test('the select-all button shows none, some and all', async function (assert) {
		this.selection = new Selection();
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @selectable={{true}} @selection={{this.selection}} />`);
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-square-o');
		await click('[data-test-data-table-row="1"] [data-test-data-table-select]');
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-minus-square-o');
		await click('[data-test-data-table-row="2"] [data-test-data-table-select]');
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-check-square');
	});

	test('row actions are icon buttons next to the more menu', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:rowActions as |record|><button type="button" class="btn btn-box-tool" title="Edit" aria-label="Edit" data-test-edit={{record.id}}><i class="fa fa-pencil"></i></button></:rowActions>
			<:moreActions as |record|><button type="button">Del {{record.id}}</button></:moreActions>
		</AppUi::DataTable>`);
		assert.dom('[data-test-data-table-row="1"] td.actions .btn-box-tool').exists();
		assert.dom('[data-test-data-table-row="1"] td.actions [data-test-data-table-more] .app-dropdown-btn').hasAttribute('aria-label');
	});

	test('the actions header and cells stay table cells', async function (assert) {
		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}}>
			<:rowActions as |record|><button type="button">Edit {{record.id}}</button></:rowActions>
		</AppUi::DataTable>`);
		assert.strictEqual(getComputedStyle(this.element.querySelector('th.actions')).display, 'table-cell');
		assert.strictEqual(getComputedStyle(this.element.querySelector('td.actions')).display, 'table-cell');

		await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} />`);
		for (const cell of this.element.querySelectorAll('th.actions, td.actions')) {
			assert.strictEqual(getComputedStyle(cell).display, 'table-cell');
		}
	});

	module('tree rows', function (hooks) {
		hooks.beforeEach(function () {
			this.toggled = [];
			this.onToggle = (record) => this.toggled.push(record.id);
			this.isExpandable = (record) => record.children;
			this.groupKey = (record) => record.group;
			this.groupLabel = (key) => key;
			this.treeRows = [
				{ id: 'b1', name: 'Blocked by', level: 1, group: 'blocks', children: true },
				{ id: 'b2', name: 'Child', level: 2, group: 'blocks', children: false },
				{ id: 'me', name: 'Current', level: 1, group: null, children: true },
				{ id: 'r1', name: 'Relates', level: 1, group: 'relates', children: true },
			];
			this.set('expandedIds', ['b1']);
			this.set('loadingIds', []);
		});

		test('it indents by depth and draws the caret states', async function (assert) {
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.treeRows}} @depthKey="level"
				@isExpandable={{this.isExpandable}} @expandedIds={{this.expandedIds}} @loadingIds={{this.loadingIds}}
				@onToggle={{this.onToggle}} />`);
			assert.dom('[data-test-data-table-row="b2"] [data-test-data-table-cell="name"]').hasClass('data-table-depth-2');
			assert.dom('[data-test-data-table-row="b2"] [data-test-data-table-cell="models"]').doesNotHaveClass('data-table-depth-2');
			assert.dom('[data-test-data-table-row="b1"] [data-test-data-table-cell="name"]').hasClass('data-table-depth-1');
			assert.dom('[data-test-data-table-row="b1"] [data-test-data-table-toggle]').hasAttribute('aria-expanded', 'true');
			assert.dom('[data-test-data-table-row="b1"] [data-test-data-table-toggle] i').hasClass('fa-caret-down');
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle]').hasAttribute('aria-expanded', 'false');
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle] i').hasClass('fa-caret-right');
			assert.dom('[data-test-data-table-row="b2"] [data-test-data-table-toggle]').doesNotExist('a leaf has no caret');
			assert.dom('[data-test-data-table-row="b2"] .data-table-toggle-spacer').exists();
		});

		test('a loading row shows a spinner in place of the caret', async function (assert) {
			this.set('loadingIds', ['r1']);
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.treeRows}} @depthKey="level"
				@isExpandable={{this.isExpandable}} @expandedIds={{this.expandedIds}} @loadingIds={{this.loadingIds}} />`);
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle] i').hasClass('fa-spinner').hasClass('fa-spin');
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle] i').doesNotHaveClass('fa-caret-right');
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle]').hasAttribute('aria-busy', 'true');
			this.set('loadingIds', []);
			await settled();
			assert.dom('[data-test-data-table-row="r1"] [data-test-data-table-toggle] i').hasClass('fa-caret-right');
		});

		test('a caret click reports the record', async function (assert) {
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.treeRows}} @depthKey="level"
				@isExpandable={{this.isExpandable}} @expandedIds={{this.expandedIds}} @onToggle={{this.onToggle}} />`);
			await click('[data-test-data-table-row="r1"] [data-test-data-table-toggle]');
			await click('[data-test-data-table-row="b1"] [data-test-data-table-toggle]');
			assert.deepEqual(this.toggled, ['r1', 'b1']);
		});

		test('the current row is pinned: class, no caret and no row actions', async function (assert) {
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.treeRows}} @depthKey="level"
				@isExpandable={{this.isExpandable}} @currentId="me">
				<:rowActions><button type="button" class="btn btn-box-tool" data-test-row-action>Edit</button></:rowActions>
			</AppUi::DataTable>`);
			assert.dom('[data-test-data-table-row="me"]').hasClass('data-table-row--current');
			assert.dom('[data-test-data-table-row="b1"]').doesNotHaveClass('data-table-row--current');
			assert.dom('[data-test-data-table-row="me"] [data-test-data-table-toggle]').doesNotExist();
			assert.dom('[data-test-data-table-row="me"] [data-test-row-action]').doesNotExist();
			assert.dom('[data-test-data-table-row="me"] td.actions').exists('the actions cell stays so the columns line up');
			assert.dom('[data-test-data-table-row="b1"] [data-test-row-action]').exists();
		});

		test('a row with a null group renders ungrouped between the groups', async function (assert) {
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.treeRows}} @depthKey="level"
				@isExpandable={{this.isExpandable}} @groupKey={{this.groupKey}} @groupLabel={{this.groupLabel}} @currentId="me" />`);
			let order = [...this.element.querySelectorAll('tbody > tr')].map((tr) =>
				tr.hasAttribute('data-test-data-table-group')
					? `group:${tr.getAttribute('data-test-data-table-group')}`
					: tr.getAttribute('data-test-data-table-row'),
			);
			assert.deepEqual(order, ['group:blocks', 'b1', 'b2', 'me', 'group:relates', 'r1']);
			await click('[data-test-data-table-group="blocks"] [data-test-data-table-group-toggle]');
			assert.dom('[data-test-data-table-row="b1"]').doesNotExist();
			assert.dom('[data-test-data-table-row="me"]').exists();
		});

		test('without the tree args list tables are unchanged', async function (assert) {
			this.groupKey = (record) => (record.models === 'opus' ? null : record.models);
			await render(hbs`<AppUi::DataTable @columns={{this.columns}} @rows={{this.rows}} @groupKey={{this.groupKey}} @groupLabel={{this.groupLabel}} />`);
			assert.dom('[data-test-data-table-toggle]').doesNotExist();
			assert.dom('.data-table-toggle-spacer').doesNotExist();
			assert.dom('.data-table-row--current').doesNotExist();
			assert.dom('[data-test-data-table-row="1"] [data-test-data-table-cell="name"]').hasClass('name-cell');
			assert.dom('[class*="data-table-depth"]').doesNotExist();
			assert.dom('tr.data-table-group').exists({ count: 2 }, 'a null key still forms the None group');
		});
	});
});

