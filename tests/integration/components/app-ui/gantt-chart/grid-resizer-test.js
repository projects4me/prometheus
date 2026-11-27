import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/gantt-chart/grid-resizer', function (hooks) {
	setupRenderingTest(hooks);

	test('it is a focusable vertical separator with its values', async function (assert) {
		this.set('width', 420);
		await render(hbs`<AppUi::GanttChart::GridResizer @width={{this.width}} @min={{240}} @max={{600}} />`);
		let handle = find('[data-test-gantt-grid-resizer]');
		assert.strictEqual(handle.getAttribute('role'), 'separator');
		assert.strictEqual(handle.getAttribute('aria-orientation'), 'vertical');
		assert.strictEqual(handle.getAttribute('aria-valuenow'), '420');
		assert.strictEqual(handle.getAttribute('aria-valuemin'), '240');
		assert.strictEqual(handle.getAttribute('aria-valuemax'), '600');
	});

	test('arrow keys move it by 16px and a double click resets', async function (assert) {
		let widths = [];
		this.set('width', 420);
		this.set('resize', (w) => widths.push(w));
		this.set('reset', () => widths.push('reset'));
		await render(hbs`<AppUi::GanttChart::GridResizer @width={{this.width}} @min={{240}} @max={{600}} @onResize={{this.resize}} @onReset={{this.reset}} />`);
		await triggerKeyEvent('[data-test-gantt-grid-resizer]', 'keydown', 'ArrowRight');
		await triggerKeyEvent('[data-test-gantt-grid-resizer]', 'keydown', 'ArrowLeft');
		await triggerEvent('[data-test-gantt-grid-resizer]', 'dblclick');
		assert.deepEqual(widths, [436, 404, 'reset']);
	});
});
