import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | click-outside', function (hooks) {
	setupRenderingTest(hooks);

	test('it triggers the handler on an outside click', async function (assert) {
		this.set('callCount', 0);
		this.set('myAction', () => {
			this.set('callCount', this.get('callCount') + 1);
		});

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.myAction}} data-test-inside>
            Inside Element
        </div>
        `);

		await click('[data-test-outside]');

		assert.strictEqual(this.callCount, 1, 'the handler was called once');
	});

	test('it does not trigger the handler on an inside click', async function (assert) {
		this.set('callCount', 0);
		this.set('myAction', () => {
			this.set('callCount', this.get('callCount') + 1);
		});

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.myAction}} data-test-inside>
            Inside Element
        </div>
        `);

		await click('[data-test-inside]');

		assert.strictEqual(this.callCount, 0, 'the handler was not called');
	});

	test('it does not trigger the handler on a nested inside click', async function (assert) {
		this.set('callCount', 0);
		this.set('myAction', () => {
			this.set('callCount', this.get('callCount') + 1);
		});

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.myAction}} data-test-parent>
            <div data-test-child>
            <span data-test-grandchild>Inside Element</span>
            </div>
        </div>
        `);

		await click('[data-test-grandchild]');

		assert.strictEqual(
			this.callCount,
			0,
			'the handler was not called when clicking a nested element'
		);
	});

	test('it does not trigger the handler when disabled', async function (assert) {
		this.set('callCount', 0);
		this.set('myAction', () => {
			this.set('callCount', this.get('callCount') + 1);
		});

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.myAction disabled=true}} data-test-inside>
            Inside Element
        </div>
        `);

		await click('[data-test-outside]');

		assert.strictEqual(
			this.callCount,
			0,
			'the handler was not called because it was disabled'
		);
	});

	test('it works correctly when the disabled state changes', async function (assert) {
		this.set('callCount', 0);
		this.set('myAction', () => {
			this.set('callCount', this.get('callCount') + 1);
		});
		this.set('isDisabled', true);

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.myAction disabled=this.isDisabled}} data-test-inside>
            Inside Element
        </div>
        `);

		// Initially disabled, should not trigger
		await click('[data-test-outside]');
		assert.strictEqual(
			this.callCount,
			0,
			'the handler was not called on the first click because it was disabled'
		);

		// Re-enable the modifier
		this.set('isDisabled', false);

		// Now it should trigger
		await click('[data-test-outside]');
		assert.strictEqual(
			this.callCount,
			1,
			'the handler was called after being re-enabled'
		);

		// Disable it again
		this.set('isDisabled', true);

		// Should not trigger
		await click('[data-test-outside]');
		assert.strictEqual(
			this.callCount,
			1,
			'the handler was not called again after being re-disabled'
		);
	});

	test('it works with multiple instances of the modifier', async function (assert) {
		this.set('callCount1', 0);
		this.set('callCount2', 0);
		this.set('action1', () =>
			this.set('callCount1', this.get('callCount1') + 1)
		);
		this.set('action2', () =>
			this.set('callCount2', this.get('callCount2') + 1)
		);

		await render(hbs`
        <div data-test-outside>Outside Element</div>
        <div {{click-outside this.action1}} data-test-box-1>Box 1</div>
        <div {{click-outside this.action2}} data-test-box-2>Box 2</div>
        `);

		// Click inside box 1
		await click('[data-test-box-1]');
		assert.strictEqual(
			this.callCount1,
			0,
			'handler 1 is not called on inside click'
		);
		assert.strictEqual(
			this.callCount2,
			1,
			'handler 2 is called when clicking outside of it (but inside box 1)'
		);

		// Click inside box 2
		await click('[data-test-box-2]');
		assert.strictEqual(
			this.callCount1,
			1,
			'handler 1 is called when clicking outside of it (but inside box 2)'
		);
		assert.strictEqual(
			this.callCount2,
			1,
			'handler 2 is not called on its own inside click'
		);

		// Click outside both
		await click('[data-test-outside]');
		assert.strictEqual(
			this.callCount1,
			2,
			'handler 1 is called on outside click'
		);
		assert.strictEqual(
			this.callCount2,
			2,
			'handler 2 is called on outside click'
		);
	});
});
