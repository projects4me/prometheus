import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/pager', function (hooks) {
	setupRenderingTest(hooks);

	test('the state switch forces the pager into its states and page changes are logged', async function (assert) {
		this.set('entry', { name: 'pager', label: 'Pager', status: 'experimental', summary: 's', usedIn: [], doc: 'pager.md' });
		await render(hbs`<Developer::Demos::Pager @entry={{this.entry}} />`);
		assert.dom('[data-test-pager-range]').hasText('1-20 / 64');
		assert.dom('[data-test-pager-previous]').isDisabled();

		await click('[data-state="middle"]');
		assert.dom('[data-test-pager-range]').hasText('21-40 / 64');

		await click('[data-state="last page"]');
		assert.dom('[data-test-pager-range]').hasText('61-64 / 64');
		assert.dom('[data-test-pager-next]').isDisabled();

		await click('[data-state="unknown total"]');
		assert.dom('[data-test-pager-range]').hasText('1-20 / 20+');
		await click('[data-test-pager-next]');
		assert.dom('[data-event-log]').includesText('page');

		await click('[data-state="disabled"]');
		assert.dom('[data-test-pager-next]').isDisabled();
		assert.dom('[data-test-pager-previous]').isDisabled();
	});
});
