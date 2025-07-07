import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pagination', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders the basic structure and controls', async function (assert) {
		await render(hbs`<Pagination />`);

		assert
			.dom('.pagination-container')
			.exists('Pagination container is rendered');
		assert
			.dom('.pagination-data-container')
			.exists('Data container is rendered');
		assert.dom('.pagination-footer').exists('Footer is rendered');
		assert.dom('.pagination-controls').exists('Controls are rendered');
		assert
			.dom('[data-pagination-prev]')
			.exists('Previous button is rendered');
		assert.dom('[data-pagination-next]').exists('Next button is rendered');
		assert.dom('.pagination-info').exists('Page info is rendered');
		assert
			.dom('.pagination-text')
			.hasText('Page 1', 'Default page text is rendered');
	});

	test('it yields block content', async function (assert) {
		await render(hbs`
        <Pagination @loadingText="Loading...">
            <:center>
                Custom Center
            </:center>
        </Pagination>
        `);

		assert
			.dom('[data-pagination-info] span')
			.hasText('Custom Center', 'Custom center block is rendered');
	});

	test('it shows loading indicator when loading', async function (assert) {
		let resolvePromise;
		this.set('onPageChange', () => {
			return new Promise((resolve) => {
				resolvePromise = resolve;
			});
		});

		await render(hbs`
			<Pagination @onPageChange={{this.onPageChange}} @loadingText="Loading..." />
		`);

		await click('[data-pagination-next]');
		assert
			.dom('[data-pagination-loading]')
			.exists('Loading indicator is rendered');
		assert
			.dom('[data-pagination-loading] span')
			.hasText('Loading...', 'Loading text is shown');

		// Clean up: resolve the promise to finish loading
		resolvePromise({ items: [], hasMore: false });
		await settled();
	});
});
