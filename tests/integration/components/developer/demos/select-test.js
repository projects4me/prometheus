import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { chooseOption, openSelect, selectedOptionsSelector } from 'prometheus/tests/helpers/select';

module('Integration | Component | developer/demos/select', function (hooks) {
	setupRenderingTest(hooks);

	test('it chooses an option, applies the controls and logs the events', async function (assert) {
		this.set('entry', { name: 'select', label: 'Select', status: 'stable', summary: 's', usedIn: [] });
		await render(hbs`<Developer::Demos::Select @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-select]').includesText('Select a project');

		await openSelect('[data-demo-select]');
		assert.dom('[data-demo-select-option]').exists({ count: 4 });
		assert.dom('[data-event-log-row]').includesText('open');

		await chooseOption('[data-demo-select]', 'A Gaia');
		assert.dom('[data-test-demo-select] [data-demo-select-option="agaia"]').exists();
		assert.dom('[data-event-log]').includesText('agaia');

		await click('[data-control-multiple]');
		await chooseOption('[data-demo-select]', 'A Hermes');
		await chooseOption('[data-demo-select]', 'A Ares');
		assert.dom(selectedOptionsSelector('[data-demo-select]')).exists({ count: 2 });

		await click('[data-control-disabled]');
		assert.dom('[data-test-demo-select]').hasAttribute('aria-disabled', 'true');
	});
});
