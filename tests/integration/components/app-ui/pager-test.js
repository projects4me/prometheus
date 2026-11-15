import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/pager', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.calls = [];
		this.onPageChange = (offset) => this.calls.push(offset);
		this.set('offset', 0);
		this.set('count', 20);
		this.set('hasMore', true);
		this.set('disabled', false);
	});

	const template = hbs`<AppUi::Pager @offset={{this.offset}} @limit={{20}} @count={{this.count}} @hasMore={{this.hasMore}} @disabled={{this.disabled}} @onPageChange={{this.onPageChange}} />`;

	test('with more rows the range reads 20+ and only next is enabled', async function (assert) {
		await render(template);
		assert.dom('[data-test-pager-range]').hasText('1-20 / 20+');
		assert.dom('[data-test-pager-previous]').isDisabled();
		assert.dom('[data-test-pager-next]').isNotDisabled();
	});

	test('the last page reads the rows shown and disables next', async function (assert) {
		this.set('offset', 20);
		this.set('count', 5);
		this.set('hasMore', false);
		await render(template);
		assert.dom('[data-test-pager-range]').hasText('21-25 / 25');
		assert.dom('[data-test-pager-previous]').isNotDisabled();
		assert.dom('[data-test-pager-next]').isDisabled();
	});

	test('it reports the offset of the next and the previous page', async function (assert) {
		this.set('offset', 20);
		await render(template);
		await click('[data-test-pager-next]');
		await click('[data-test-pager-previous]');
		assert.deepEqual(this.calls, [40, 0]);
	});

	test('both buttons are disabled while @disabled', async function (assert) {
		this.set('offset', 20);
		this.set('disabled', true);
		await render(template);
		assert.dom('[data-test-pager-previous]').isDisabled();
		assert.dom('[data-test-pager-next]').isDisabled();
	});

	test('an empty first page reads 1-0 / 0', async function (assert) {
		this.set('count', 0);
		this.set('hasMore', false);
		await render(template);
		assert.dom('[data-test-pager-range]').hasText('1-0 / 0');
	});

	test('with a total the range reads it and next follows it', async function (assert) {
		await render(hbs`<AppUi::Pager @offset={{this.offset}} @limit={{20}} @total={{64}} @onPageChange={{this.onPageChange}} />`);
		assert.dom('[data-test-pager-range]').hasText('1-20 / 64');
		this.set('offset', 60);
		assert.dom('[data-test-pager-range]').hasText('61-64 / 64');
		assert.dom('[data-test-pager-next]').isDisabled();
	});

	test('@compact draws the small buttons', async function (assert) {
		await render(hbs`<AppUi::Pager @offset={{0}} @limit={{20}} @count={{3}} @compact={{true}} />`);
		assert.dom('[data-test-pager-next]').hasClass('btn-xs');
		assert.dom('[data-test-pager-next] i').hasClass('fa-angle-right');
	});
});
