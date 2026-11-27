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

	test('icon shows a set of icons with each argument and the controls change them', async function (assert) {
		await render(hbs`<Developer::Demos::Icon @entry={{this.entry}} />`);
		assert.dom('[data-test-demo-icon]').exists({ count: 12 });
		assert.dom('[data-demo-icon-row="users"] [data-test-demo-icon]').hasClass('fa-users');
		assert.dom('[data-test-demo-icon-size="5x"]').hasClass('fa-5x');
		assert.dom('[data-test-demo-icon-spin]').hasClass('fa-spin');
		assert.dom('[data-test-demo-icon-labelled] .sr-only').hasText('Delete');
		assert.dom('[data-test-demo-icon-passthrough]').hasClass('fa-times');
		assert.dom('[data-test-demo-icon-passthrough]').hasClass('text-danger');

		await click('[data-control-icon-size] [data-size="2x"]');
		await click('[data-control-icon-fixed-width]');
		await click('[data-control-icon-spin]');
		assert.dom('[data-demo-icon-row="cog"] [data-test-demo-icon]').hasClass('fa-2x');
		assert.dom('[data-demo-icon-row="cog"] [data-test-demo-icon]').hasClass('fa-fw');
		assert.dom('[data-demo-icon-row="cog"] [data-test-demo-icon]').hasClass('fa-spin');
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
