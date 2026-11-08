import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/demos/modal', function (hooks) {
	setupRenderingTest(hooks);

	let original;
	hooks.beforeEach(function () {
		original = window.fetch;
		window.fetch = async () => ({
			ok: true,
			status: 200,
			headers: { get: () => 'text/markdown' },
			text: async () => '## Overview\nModal docs',
		});
	});
	hooks.afterEach(function () {
		window.fetch = original;
	});

	const rows = () => [...document.querySelectorAll('[data-event-log-row]')].map((r) => r.textContent);

	test('it opens, confirms synchronously and logs the events', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await click('[data-state="sync"]');
		await click('[data-modal-open]');
		await waitUntil(() => document.querySelector('[data-modal-box] [data-modal-content]'));
		assert.dom('[data-modal-box] [data-modal-content]').includesText('inside the box');
		await click('[data-btn="save"]');
		await waitUntil(() => rows().some((r) => r.includes('hide')), { timeout: 3000 });
		const text = rows().join('|');
		assert.ok(text.includes('open'), 'open logged');
		assert.ok(text.includes('confirm'), 'confirm logged');
		assert.ok(text.includes('hide'), 'hide logged');
	});

	test('it renders with in-element outside the box and hides the confirm button on demand', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await click('[data-state="in-element"]');
		await click('[data-state="removed"]');
		await click('[data-modal-open]');
		await waitUntil(() => document.querySelector('[data-modal-content]'));
		assert.dom('[data-modal-box] [data-modal-content]').doesNotExist();
		assert.dom('[data-modal-content]').includesText('in-element');
		assert.dom('[data-btn="save"]').doesNotExist();
		await click('[data-btn="cancel"]');
		await waitUntil(() => rows().some((r) => r.includes('cancel') || r.includes('hide')), { timeout: 3000 });
		await settled();
	});

	test('it renders the docs', async function (assert) {
		await render(hbs`<Developer::Demos::Modal />`);
		await settled();
		assert.dom('[data-docs-content]').includesText('Modal docs');
	});
});
