import { module, test } from 'qunit';
import { clampGridWidth, maxGridWidth, visibleColumns } from 'prometheus/utils/gantt/grid-width';

module('Unit | Utility | gantt/grid-width', function () {
	test('the limits are 240px and half the container', function (assert) {
		assert.strictEqual(clampGridWidth(100, 1200), 240);
		assert.strictEqual(clampGridWidth(900, 1200), 600);
		assert.strictEqual(clampGridWidth(400, 1200), 400);
		assert.strictEqual(maxGridWidth(300), 240, 'never below the minimum');
	});

	test('a missing or invalid width gives the default 420', function (assert) {
		assert.strictEqual(clampGridWidth(null, 2000), 420);
		assert.strictEqual(clampGridWidth('x', 2000), 420);
	});

	test('columns drop in order as the grid narrows', function (assert) {
		assert.strictEqual(visibleColumns(600), 5);
		assert.strictEqual(visibleColumns(420), 4, 'Planned start gone');
		assert.strictEqual(visibleColumns(370), 3);
		assert.strictEqual(visibleColumns(300), 2);
		assert.strictEqual(visibleColumns(240), 1, 'only Who left');
		assert.strictEqual(visibleColumns(200), 0);
	});
});
