import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/data-table', function (hooks) {
	setupRenderingTest(hooks);

	test('it keeps a selection across the three fixture pages and shows the more menu', async function (assert) {
		this.set('entry', { name: 'data-table', label: 'DataTable', status: 'experimental', summary: 's', usedIn: [], doc: 'data-table.md' });
		await render(hbs`<Developer::Demos::DataTable @entry={{this.entry}} />`);
		assert.dom('[data-test-data-table-row]').exists({ count: 4 });
		await click('[data-test-data-table-row] [data-test-data-table-select]');
		await click('[data-page="2"]');
		await click('[data-test-data-table-row] [data-test-data-table-select]');
		assert.dom('[data-test-demo-data-table]').includesText('(Selected : 2)');
		await click('[data-page="1"]');
		assert.dom('[data-test-data-table-select][aria-pressed="true"]').exists({ count: 1 });

		await click('[data-test-data-table-row] [data-test-data-table-more] button');
		assert.dom('[data-test-data-table-more] .app-dropdown-content.show').exists();
	});
});
