import { module, test } from 'qunit';
import { hasNextPage } from 'prometheus/utils/quick-list/page-window';

module('Unit | Utility | quick-list/page-window', function () {
	test('a next link means there is a next page', function (assert) {
		assert.true(hasNextPage({ links: { next: { href: '/idea?page=2' } } }));
	});

	test('no next link, no links or no meta means the last page', function (assert) {
		assert.false(hasNextPage({ links: { prev: { href: '/idea?page=1' } } }));
		assert.false(hasNextPage({ links: {} }));
		assert.false(hasNextPage({}));
		assert.false(hasNextPage(undefined));
		assert.false(hasNextPage(null));
	});
});
