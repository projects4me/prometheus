import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | infinite-scroll', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders yielded content', async function (assert) {
		await render(hbs`
            <InfiniteScroll>
                <div class="test-content" data-content>Content goes here</div>
            </InfiniteScroll>
        `);

		assert
			.dom('[data-content]')
			.exists('The yielded content is rendered');
		assert.dom('[data-content]').hasText('Content goes here');
	});

	test('it shows load more button when configured', async function (assert) {
		this.set('loadMore', () => true);

		await render(hbs`
            <InfiniteScroll
                @useLoadMoreButton={{true}}
                @onLoadMore={{this.loadMore}}
            >
                Content
            </InfiniteScroll>
        `);

		assert
			.dom('[data-load-more-button]')
			.exists('Load more button is shown');
	});

	test('it calls loadMore action when button clicked', async function (assert) {
		assert.expect(1);

		this.set('loadMore', () => {
			assert.ok(true, 'loadMore action was triggered');
			return true;
		});

		await render(hbs`
            <InfiniteScroll
                @useLoadMoreButton={{true}}
                @onLoadMore={{this.loadMore}}
            >
                Content
            </InfiniteScroll>
        `);

		await click('[data-load-more-button]');
	});

	test('it shows loading indicator during loadMore', async function (assert) {
		let resolvePromise;

		this.set('loadMore', () => {
			return new Promise((resolve) => {
				resolvePromise = resolve;
			});
		});

		await render(hbs`
            <InfiniteScroll
                @useLoadMoreButton={{true}}
                @onLoadMore={{this.loadMore}}
                @loadingText="Loading..."
            >
                Content
            </InfiniteScroll>
        `);

		// Click but don't wait for the promise to resolve
		await click('[data-load-more-button]');

		await settled();

		assert
			.dom('[data-infinite-scroll-loading]')
			.exists('Loading indicator is shown');
		assert
			.dom('[data-loading-indicator] span')
			.hasText('Loading...', 'Loading text is correct');

		// Resolve the promise to clean up
		resolvePromise(true);
		await settled();
	});
});
