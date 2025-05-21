import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | infinite-scroll', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders yielded content', async function (assert) {
		await render(hbs`
            <InfiniteScroll>
                <div class="test-content" data-test-content>Content goes here</div>
            </InfiniteScroll>
        `);

		assert
			.dom('[data-test-content]')
			.exists('The yielded content is rendered');
		assert.dom('[data-test-content]').hasText('Content goes here');
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
			.dom('[data-test-load-more-button]')
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

		await click('[data-test-load-more-button]');
	});

	test('it shows end message when hasReachedEnd is true', async function (assert) {
		this.set('loadMore', async () => {
			return false;
		});

		await render(hbs`
            <InfiniteScroll
                @useLoadMoreButton={{true}}
                @onLoadMore={{this.loadMore}}
                @endMessageText="No more items"
            >
                Content
            </InfiniteScroll>
        `);

		await click('[data-test-load-more-button]');
		await settled();

		assert
			.dom('[data-test-infinite-scroll-end]')
			.exists('End message container is shown');
		assert.dom('[data-test-end-message]').exists('End message is shown');
		assert
			.dom('[data-test-end-message] span')
			.hasText('No more items', 'End message has correct text');
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
		await click('[data-test-load-more-button]');

		await settled();

		assert
			.dom('[data-test-infinite-scroll-loading]')
			.exists('Loading indicator is shown');
		assert
			.dom('[data-test-loading-indicator] span')
			.hasText('Loading...', 'Loading text is correct');

		// Resolve the promise to clean up
		resolvePromise(true);
		await settled();
	});
});
