import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | dropdown-toggle', function (hooks) {
	setupRenderingTest(hooks);

	const template = hbs`
		<div data-test-outside>Outside</div>
		<div class="dropdown" data-test-one>
			<span role="button" tabindex="0" data-test-toggle-one {{dropdown-toggle}}>One</span>
			<ul class="dropdown-menu"><li>a</li></ul>
		</div>
		<div class="btn-group" data-test-two>
			<button type="button" data-test-toggle-two {{dropdown-toggle}}>Two</button>
		</div>
	`;

	test('a click opens and closes the menu and sets aria-expanded', async function (assert) {
		await render(template);
		await click('[data-test-toggle-one]');
		assert.dom('[data-test-one]').hasClass('open');
		assert.dom('[data-test-toggle-one]').hasAttribute('aria-expanded', 'true');
		await click('[data-test-toggle-one]');
		assert.dom('[data-test-one]').doesNotHaveClass('open');
		assert.dom('[data-test-toggle-one]').hasAttribute('aria-expanded', 'false');
	});

	test('an outside click closes the menu', async function (assert) {
		await render(template);
		await click('[data-test-toggle-one]');
		await click('[data-test-outside]');
		assert.dom('[data-test-one]').doesNotHaveClass('open');
	});

	test('Escape closes the menu', async function (assert) {
		await render(template);
		await click('[data-test-toggle-one]');
		await triggerKeyEvent('[data-test-toggle-one]', 'keydown', 'Escape');
		assert.dom('[data-test-one]').doesNotHaveClass('open');
	});

	test('opening another dropdown closes the first', async function (assert) {
		await render(template);
		await click('[data-test-toggle-one]');
		await click('[data-test-toggle-two]');
		assert.dom('[data-test-one]').doesNotHaveClass('open');
		assert.dom('[data-test-two]').hasClass('open');
	});

	test('Enter opens a non-button toggle', async function (assert) {
		await render(template);
		await triggerKeyEvent('[data-test-toggle-one]', 'keydown', 'Enter');
		assert.dom('[data-test-one]').hasClass('open');
	});
});
