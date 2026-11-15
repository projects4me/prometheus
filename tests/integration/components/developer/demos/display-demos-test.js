import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/display', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.set('entry', { name: 'x', label: 'X', status: 'stable', summary: 's', usedIn: [] });
	});

	test('box applies the variant and toggles the parts', async function (assert) {
		await render(hbs`<Developer::Demos::Box @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-box]').hasClass('box-primary');
		assert.dom('[data-test-demo-box] .box-footer').hasText('The footer of the box.');
		await click('[data-variant="danger"]');
		assert.dom('[data-test-demo-box]').hasClass('box-danger');
		await click('[data-control-footer]');
		assert.dom('[data-test-demo-box] .box-footer').hasText('');
	});

	test('avatar shows a person, an agent and a missing image in each size', async function (assert) {
		await render(hbs`<Developer::Demos::Avatar @entry={{this.entry}} />`);
		assert.dom('[data-test-avatar]').exists({ count: 9 });
		assert.dom('[data-test-avatar].img-sm').exists({ count: 2 });
		assert.dom('[data-test-avatar].img-xs').exists({ count: 2 });
	});

	test('status label shows the chosen status', async function (assert) {
		await render(hbs`<Developer::Demos::StatusLabel @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-status]').exists();
		await click('[data-status="Closed"]');
		assert.dom('[data-test-demo-status]').hasClass('Closed');
	});
});
