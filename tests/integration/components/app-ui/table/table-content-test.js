import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
	'Integration | Component | app-ui/table/table-content',
	function (hooks) {
		setupRenderingTest(hooks);

		test('it renders columns correctly', async function (assert) {
            const columns = [
                { label: 'Name', valueKey: 'name' },
                { label: 'Age', valueKey: 'age' }
            ];
    
            this.set('columns', columns);
            await render(hbs`<AppUi::Table::TableContent @columns={{this.columns}} />`);
            
            assert.dom('th').exists({ count: 2 }, 'Two column headers are rendered');
            assert.dom('th').hasText('Name', 'First column header is correct');
            assert.dom('th:nth-child(2)').hasText('Age', 'Second column header is correct');
		});
        test('it renders data rows correctly', async function (assert) {
            const columns = [{ label: 'Name', valueKey: 'name' }];
            const data = [{ name: 'John' }, { name: 'Jane' }];
    
            this.set('columns', columns);
            this.set('data', data);
            await render(hbs`<AppUi::Table::TableContent @columns={{this.columns}} @data={{this.data}} />`);
    
            assert.dom('tbody tr').exists({ count: 2 }, 'Two data rows are rendered');
            assert.dom('tbody tr:first-child td').hasText('John', 'First row data is correct');
            assert.dom('tbody tr:last-child td').hasText('Jane', 'Second row data is correct');
        });        
	}
);
