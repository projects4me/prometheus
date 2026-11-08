import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quick-list/pagination', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.calls = [];
		this.onPage = (page) => this.calls.push(page);
		this.set('page', 1);
		this.set('disabled', false);
	});

	const template = hbs`<QuickList::Pagination @page={{this.page}} @limit={{20}} @total={{64}} @disabled={{this.disabled}} @onPage={{this.onPage}} />`;

	test('it shows the range and total', async function (assert) {
		await render(template);
		assert.dom('[data-quick-list-pagination-range]').hasText('1-20 / 64');
		this.set('page', 4);
		assert.dom('[data-quick-list-pagination-range]').hasText('61-64 / 64');
	});

	test('previous is disabled on the first page, next on the last', async function (assert) {
		await render(template);
		assert.dom('[data-quick-list-pagination-prev]').isDisabled();
		assert.dom('[data-quick-list-pagination-next]').isNotDisabled();
		this.set('page', 4);
		assert.dom('[data-quick-list-pagination-prev]').isNotDisabled();
		assert.dom('[data-quick-list-pagination-next]').isDisabled();
	});

	test('both buttons are disabled while @disabled', async function (assert) {
		this.set('page', 2);
		this.set('disabled', true);
		await render(template);
		assert.dom('[data-quick-list-pagination-prev]').isDisabled();
		assert.dom('[data-quick-list-pagination-next]').isDisabled();
	});

	test('it renders nothing when everything fits on one page', async function (assert) {
		await render(
			hbs`<QuickList::Pagination @page={{1}} @limit={{20}} @total={{20}} @onPage={{this.onPage}} />`,
		);
		assert.dom('[data-quick-list-pagination]').doesNotExist();
	});

	test('it calls @onPage with the new page', async function (assert) {
		this.set('page', 2);
		await render(template);
		await click('[data-quick-list-pagination-next]');
		await click('[data-quick-list-pagination-prev]');
		assert.deepEqual(this.calls, [3, 1]);
	});
});
