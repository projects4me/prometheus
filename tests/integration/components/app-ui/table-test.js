import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/table', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders with basic structure', async function (assert) {
		await render(hbs`<AppUi::Table />`);
		
		assert.dom('.box').exists('Box container is rendered');
		assert.dom('.box-header').exists('Header section is rendered');
		assert.dom('.box-body').exists('Body section is rendered');
		assert.dom('table').exists('Table is rendered');
	});

	test('it renders header when provided', async function (assert) {
		await render(hbs`<AppUi::Table @header="Test Header" />`);
		
		assert.dom('.box-title').hasText('Test Header', 'Header text is rendered correctly');
	});

	test('it renders search input when showSearch is true', async function (assert) {
		await render(hbs`<AppUi::Table @showSearch={{true}} />`);
		
		assert.dom('#table-search').exists('Search input is rendered');
		assert.dom('#table-search').hasAttribute('placeholder', 'Search...', 'Default placeholder is set');
	});

	test('it renders custom search placeholder', async function (assert) {
		await render(hbs`<AppUi::Table @searchPlaceholder="Custom Search..." />`);
		
		assert.dom('#table-search').hasAttribute('placeholder', 'Custom Search...', 'Custom placeholder is set');
	});

	test('it renders columns correctly', async function (assert) {
		const columns = [
			{ label: 'Name', valueKey: 'name' },
			{ label: 'Age', valueKey: 'age' }
		];

		this.set('columns', columns);
		await render(hbs`<AppUi::Table @columns={{this.columns}} />`);
		
		assert.dom('th').exists({ count: 2 }, 'Two column headers are rendered');
		assert.dom('th').hasText('Name', 'First column header is correct');
		assert.dom('th:nth-child(2)').hasText('Age', 'Second column header is correct');
	});

	test('it renders data rows correctly', async function (assert) {
		const columns = [{ label: 'Name', valueKey: 'name' }];
		const data = [{ name: 'John' }, { name: 'Jane' }];

		this.set('columns', columns);
		this.set('data', data);
		await render(hbs`<AppUi::Table @columns={{this.columns}} @data={{this.data}} />`);
		
		assert.dom('tbody tr').exists({ count: 2 }, 'Two data rows are rendered');
		assert.dom('tbody tr:first-child td').hasText('John', 'First row data is correct');
		assert.dom('tbody tr:last-child td').hasText('Jane', 'Second row data is correct');
	});

	test('it shows empty state when no data is provided', async function (assert) {
		await render(hbs`<AppUi::Table @emptyStateMessage="No items found" />`);
		assert.dom('.no-content').exists('Empty state component is rendered');
	});

	test('it handles custom search implementation', async function (assert) {
		let searchCalled = false;
		this.set('onSearch', () => {
			searchCalled = true;
		});

		await render(hbs`
			<AppUi::Table 
				@onSearch={{this.onSearch}}
				@applyDefaultSearch={{false}}
			/>
		`);

		await fillIn('#table-search', 'test');
		await triggerEvent('#table-search', 'keyup');

		assert.ok(searchCalled, 'Custom search handler is called');
	});
});
