import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/quick-list', function (hooks) {
	setupRenderingTest(hooks);

	test('it pages the fixture without totals and logs the callbacks', async function (assert) {
		this.set('entry', { name: 'quick-list', label: 'QuickList', status: 'stable', summary: 's', usedIn: [] });
		await render(hbs`<Developer::Demos::QuickList @entry={{this.entry}} />`);
		assert.dom('[data-demo-quick-list] [data-test-quick-list-row]').exists({ count: 10 });
		await fillIn('[data-control-limit]', '5');
		assert.dom('[data-demo-quick-list] [data-test-quick-list-row]').exists({ count: 5 });
		assert.dom('[data-event-log-row]').exists({ count: 0 });
		await click('[data-state="loading"]');
		assert.dom('[data-demo-quick-list] [data-test-quick-list-row]').doesNotExist();
		await click('[data-control-search]');
		assert.dom('[data-demo-search]').doesNotExist();
	});
});
