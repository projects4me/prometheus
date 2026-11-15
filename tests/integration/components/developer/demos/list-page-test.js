import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/list-page', function (hooks) {
	setupRenderingTest(hooks);

	test('it pages, sorts and selects the fixture rows and logs the events', async function (assert) {
		this.set('entry', { name: 'data-table', label: 'DataTable', status: 'experimental', summary: 's', usedIn: [], doc: 'data-table.md' });
		await render(hbs`<Developer::Demos::ListPage @entry={{this.entry}} />`);
		assert.dom('[data-test-data-table-row]').exists({ count: 10 });
		assert.dom('[data-test-pager-range]').hasText('1-10 / 10+');

		await click('[data-test-pager-next]');
		await click('[data-test-pager-next]');
		assert.dom('[data-test-pager-range]').hasText('21-23 / 23');
		assert.dom('[data-event-log]').includesText('page');

		await click('[data-test-data-table-sort="name"]');
		assert.dom('[data-test-data-table-sort="name"] i').hasClass('fa-sort-desc');

		await click('[data-test-data-table-row] [data-test-data-table-select]');
		assert.dom('[data-test-demo-list-page]').includesText('(Selected : 1)');

		await click('[data-control-empty]');
		assert.dom('[data-test-data-table-row]').doesNotExist();
		assert.dom('[data-test-data-table-empty]').includesText('No agents found.');
	});
});
