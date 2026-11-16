import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, waitUntil } from '@ember/test-helpers';
import Selection from 'prometheus/utils/state/selection';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/list-toolbar', function (hooks) {
	setupRenderingTest(hooks);

	test('it lays out the search and actions in the header and the selection and pager below', async function (assert) {
		await render(hbs`<AppUi::ListToolbar>
			<:search><input aria-label="Search" data-test-search /></:search>
			<:actions><button type="button" data-test-create>New</button></:actions>
			<:selection><button type="button" data-test-bulk>Delete</button></:selection>
			<:pager><span data-test-range>1-20</span></:pager>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-header] [data-test-search]').exists();
		assert.dom('[data-test-list-toolbar-header] [data-test-create]').exists();
		assert.dom('[data-test-list-toolbar] [data-test-bulk]').exists();
		assert.dom('[data-test-list-toolbar-pager] [data-test-range]').exists();
	});

	test('without search or actions there is no header, without a pager no pager slot', async function (assert) {
		await render(hbs`<AppUi::ListToolbar>
			<:selection><button type="button" data-test-bulk>Delete</button></:selection>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-header]').doesNotExist();
		assert.dom('[data-test-list-toolbar-pager]').doesNotExist();
		assert.dom('[data-test-list-toolbar] [data-test-bulk]').exists();
	});

	test('at the bottom position there is only the controls row', async function (assert) {
		await render(hbs`<AppUi::ListToolbar @position="bottom">
			<:search><input aria-label="Search" data-test-search /></:search>
			<:selection><button type="button" data-test-bulk>Delete</button></:selection>
			<:pager><span data-test-range>1-20</span></:pager>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-header]').doesNotExist();
		assert.dom('[data-test-list-toolbar]').hasAttribute('data-test-list-toolbar-position', 'bottom');
		assert.dom('[data-test-list-toolbar] [data-test-bulk]').exists();
		assert.dom('[data-test-list-toolbar-pager] [data-test-range]').exists();
	});

	test('with a selection and nothing selected it shows the select-all and a hint', async function (assert) {
		this.set('selection', new Selection());
		this.set('rows', [{ id: '1' }, { id: '2' }]);
		await render(hbs`<AppUi::ListToolbar @selection={{this.selection}} @rows={{this.rows}} />`);
		assert.dom('[data-test-list-toolbar-idle] [data-quick-list-select-all]').exists();
		assert.dom('[data-test-list-toolbar-hint]').exists();
		assert.dom('[data-test-list-toolbar-selection-bar]').doesNotExist();
	});

	test('the selection bar shows counts across pages, gives the bulk block the ids and clears', async function (assert) {
		let selection = new Selection(['9']);
		this.set('selection', selection);
		this.set('rows', [{ id: '1' }, { id: '2' }]);
		this.set('seen', null);
		this.set('save', (ids) => this.set('seen', ids));
		await render(hbs`<AppUi::ListToolbar @selection={{this.selection}} @rows={{this.rows}}>
			<:bulkActions as |ids|><button type="button" data-test-bulk {{on "click" (fn this.save ids)}}>Delete</button></:bulkActions>
		</AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-count]').includesText('1 selected');
		assert.dom('[data-test-list-toolbar-breakdown]').includesText('0 on this page, 1 on other pages');

		await click('[data-quick-list-select-all]');
		assert.dom('[data-test-list-toolbar-count]').includesText('3 selected');
		assert.dom('[data-test-list-toolbar-breakdown]').includesText('2 on this page, 1 on other pages');
		assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'all');

		await click('[data-test-bulk]');
		assert.deepEqual([...this.seen].sort(), ['1', '2', '9']);

		await click('[data-test-list-toolbar-clear]');
		assert.strictEqual(selection.count, 0);
		assert.dom('[data-test-list-toolbar-selection-bar]').doesNotExist();
	});

	test('the selection block still works without @selection', async function (assert) {
		await render(hbs`<AppUi::ListToolbar><:selection><i data-test-old>x</i></:selection></AppUi::ListToolbar>`);
		assert.dom('[data-test-old]').exists();
		assert.dom('[data-test-list-toolbar-idle]').doesNotExist();
	});

	test('in a narrow box it yields narrow to the search and the actions', async function (assert) {
		await render(hbs`<div data-test-box><AppUi::ListToolbar>
			<:search as |narrow|><span data-test-search-narrow>{{if narrow "narrow" "wide"}}</span></:search>
			<:actions as |narrow|><span data-test-actions-narrow>{{if narrow "narrow" "wide"}}</span></:actions>
		</AppUi::ListToolbar></div>`);
		find('[data-test-box]').style.width = '300px';
		await waitUntil(() => document.querySelector('[data-test-search-narrow]').textContent.trim() === 'narrow');
		assert.dom('[data-test-actions-narrow]').hasText('narrow');
	});

	test('in a wide box it is not narrow', async function (assert) {
		await render(hbs`<div data-test-box><AppUi::ListToolbar>
			<:search as |narrow|><span data-test-search-narrow>{{if narrow "narrow" "wide"}}</span></:search>
		</AppUi::ListToolbar></div>`);
		assert.dom('[data-test-search-narrow]').hasText('wide');
	});

	test('the search sits in a growing wrapper', async function (assert) {
		await render(hbs`<AppUi::ListToolbar><:search><input aria-label="Search" data-test-search /></:search></AppUi::ListToolbar>`);
		assert.dom('[data-test-list-toolbar-search] [data-test-search]').exists();
	});
});
