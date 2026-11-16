import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
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

	test('avatar shows people and agents in each size, with size and failing image controls', async function (assert) {
		await render(hbs`<Developer::Demos::Avatar @entry={{this.entry}} />`);
		assert.dom('[data-demo-avatar] [data-test-avatar]').exists({ count: 45 });
		assert.dom('[data-demo-avatar] [data-test-avatar][data-size="l"]').exists({ count: 9 });
		assert.dom('[data-demo-avatar-selected] [data-test-avatar]').hasAttribute('data-size', 'm');
		await fillIn('[data-demo-avatar-size]', 'l');
		assert.dom('[data-demo-avatar-selected] [data-test-avatar]').hasAttribute('data-size', 'l');
		await click('[data-demo-avatar-fails]');
		assert.dom('[data-demo-avatar-selected] [data-test-avatar-initials]').exists();
	});

	test('status label shows every status', async function (assert) {
		await render(hbs`<Developer::Demos::StatusLabel @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-status]').exists({ count: 8 });
		assert.dom('[data-demo-status-row="in_progress"] .badge').hasClass('in_progress');
	});

	test('tag demo shows the tags and the variants', async function (assert) {
		await render(hbs`<Developer::Demos::Tag @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-tag]').hasClass('app-ui-tag');
		assert.dom('[data-test-demo-tag-variant="danger"]').hasClass('app-ui-tag-danger');
	});
});
