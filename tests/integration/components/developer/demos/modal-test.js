import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../../stub-services/acl-stub';

module('Integration | Component | developer/demos/modal', function (hooks) {
	setupRenderingTest(hooks);

	let original;
	hooks.beforeEach(function () {
		this.owner.register('service:acl', AclStub);
		original = window.fetch;
		window.fetch = async () => ({
			ok: true,
			status: 200,
			headers: { get: () => 'text/markdown' },
			text: async () => '## Overview\nDialog modal docs',
		});
	});
	hooks.afterEach(function () {
		window.fetch = original;
	});

	const rows = () => [...document.querySelectorAll('[data-event-log-row]')].map((r) => r.textContent);

	test('it opens inside the constrained box as a modal dialog, confirms and logs the events', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await click('[data-state="sync"]');
		await click('[data-modal-open]');

		assert.dom('[data-modal-box] dialog.app-modal[open] [data-modal-content]').exists('rendered in the box, no in-element');
		assert.true(document.querySelector('dialog.app-modal').matches(':modal'), 'shown in the top layer');
		assert.dom('dialog.app-modal [data-field="demo.modal.tags"]').exists('the select is inside the dialog');

		await click('dialog.app-modal [data-btn="save"]');
		await waitUntil(() => rows().some((r) => r.includes('close')), { timeout: 3000 });
		assert.dom('dialog.app-modal').doesNotExist();
		const text = rows().join('|');
		assert.ok(text.includes('open'), 'open logged');
		assert.ok(text.includes('confirm'), 'confirm logged');
	});

	test('it stacks a nested modal and hides the confirm button on demand', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await click('[data-state="on"]');
		await click('[data-state="removed"]');
		await click('[data-modal-open]');
		assert.dom('dialog.app-modal [data-btn="save"]').doesNotExist();

		await click('[data-modal-open-nested]');
		assert.dom('dialog.demo-nested-modal[open] [data-modal-nested-content]').exists();

		await click('dialog.demo-nested-modal [data-btn="cancel"]');
		await waitUntil(() => rows().some((r) => r.includes('close nested')), { timeout: 3000 });
		assert.dom('dialog.demo-nested-modal').doesNotExist();
		assert.dom('dialog.app-modal[open]').exists('the outer modal stays open');

		await click('dialog.app-modal [data-btn="cancel"]');
		await waitUntil(() => !document.querySelector('dialog.app-modal'), { timeout: 3000 });
		await settled();
	});

	test('it renders the docs', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await settled();
		assert.dom('[data-docs-content]').includesText('Dialog modal docs');
	});
});
