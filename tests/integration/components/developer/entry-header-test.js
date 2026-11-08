import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/entry-header', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders label, status, summary and used in links', async function (assert) {
		this.set('entry', {
			label: 'Accordion',
			status: 'stable',
			summary: 'Collapsible sections',
			usedIn: [
				{ label: 'Home', route: 'app' },
				{ label: 'Other', route: 'app' },
			],
		});
		await render(hbs`<Developer::EntryHeader @entry={{this.entry}} />`);
		assert.dom('.box.box-primary .box-title').hasText('Accordion');
		assert.dom('[data-entry-status]').hasClass('label-success');
		assert.dom('[data-entry-status]').hasText('stable');
		assert.dom('[data-entry-summary]').hasText('Collapsible sections');
		assert.dom('[data-entry-used-in]').exists({ count: 2 });
	});

	test('experimental uses the warning label', async function (assert) {
		this.set('entry', {
			label: 'X',
			status: 'experimental',
			summary: 's',
			usedIn: [],
		});
		await render(hbs`<Developer::EntryHeader @entry={{this.entry}} />`);
		assert.dom('[data-entry-status]').hasClass('label-warning');
		assert.dom('[data-entry-used-in]').doesNotExist();
	});
});
