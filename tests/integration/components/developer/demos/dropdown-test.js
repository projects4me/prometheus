import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/dropdown', function (hooks) {
	setupRenderingTest(hooks);

	test('it opens, chooses an item, applies the controls and logs the events', async function (assert) {
		this.set('entry', { name: 'dropdown', label: 'Dropdown', status: 'stable', summary: 's', usedIn: [] });
		await render(hbs`<Developer::Demos::Dropdown @entry={{this.entry}} />`);
		assert.dom('.app-dropdown-content.show').doesNotExist();
		assert.dom('[data-demo-dropdown-divider]').exists();
		assert.dom('[data-demo-dropdown-item="recent"]').hasClass('active');

		await click('.app-dropdown-btn');
		await settled();
		assert.dom('.app-dropdown-content.show').exists();
		assert.dom('[data-event-log-row]').includesText('open');

		await click('[data-demo-dropdown-item="mine"]');
		assert.dom('[data-demo-dropdown-item="mine"]').hasClass('active');
		assert.dom('[data-event-log-row]').exists({ count: 2 });

		await click('[data-placement="right"]');
		assert.dom('[data-demo-dropdown]').hasClass('is-right');
		await click('[data-control-scoped]');
		assert.dom('[data-demo-dropdown]').hasClass('is-scoped');
		await click('[data-control-many]');
		assert.dom('[data-demo-dropdown-item]').exists({ count: 24 });

		await click('.app-dropdown-btn');
		await settled();
		assert.dom('[data-event-log]').includesText('close');
	});
});
