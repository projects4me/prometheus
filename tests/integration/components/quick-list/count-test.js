/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const COUNT = hbs`
  <QuickList::Count @count={{this.count}} @total={{this.total}} @hasNext={{this.hasNext}}
                    @showCount={{this.showCount}} @label={{this.label}} />
`;

module('Integration | Component | quick-list/count', function (hooks) {
	setupRenderingTest(hooks);

	test('it shows the plain count when the total matches or is unknown', async function (assert) {
		this.setProperties({ count: 11, total: 11 });
		await render(COUNT);
		assert.dom('[data-test-quick-list-count]').hasText('11');

		this.set('total', undefined);
		assert.dom('[data-test-quick-list-count]').hasText('11');
	});

	test('it shows count of total, and count+ when there is a next page without a total', async function (assert) {
		this.setProperties({ count: 2, total: 64 });
		await render(COUNT);
		assert.dom('[data-test-quick-list-count]').hasText('2 of 64');

		this.setProperties({ total: undefined, hasNext: true });
		assert.dom('[data-test-quick-list-count]').hasText('2+');
	});

	test('it puts the label after the count', async function (assert) {
		this.setProperties({ count: 2, hasNext: true, label: 'issues' });
		await render(COUNT);
		assert.dom('[data-test-quick-list-count]').hasText('2+ issues');
	});

	test('it renders nothing without a count or with @showCount false', async function (assert) {
		await render(COUNT);
		assert.dom('[data-test-quick-list-count]').doesNotExist();

		this.setProperties({ count: 3, showCount: false });
		assert.dom('[data-test-quick-list-count]').doesNotExist();
	});
});
