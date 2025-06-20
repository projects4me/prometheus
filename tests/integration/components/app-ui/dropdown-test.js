import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/dropdown', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders with button content', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <i class="fa fa-filter"></i>
            <span>Filters</span>
            </:button>
            <:content>
            <a href="#">Option 1</a>
            <a href="#">Option 2</a>
            </:content>
        </AppUi::Dropdown>
        `);

		assert.dom('.app-dropdown').exists('Dropdown container exists');
		assert.dom('.app-dropdown-btn').exists('Dropdown button exists');
		assert.dom('.fa-filter').exists('Filter icon exists');
		assert
			.dom('.app-dropdown-btn')
			.hasText('Filters', 'Button text is rendered');
		assert.dom('.caret').exists('Caret icon exists');
	});

	test('it renders dropdown content', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <span>Menu</span>
            </:button>
            <:content>
            <a href="#" data-test-option="1">Option 1</a>
            <a href="#" data-test-option="2">Option 2</a>
            <a href="#" data-test-option="3">Option 3</a>
            </:content>
        </AppUi::Dropdown>
        `);

		assert.dom('.app-dropdown-content').exists('Dropdown content exists');
		assert.dom('[data-test-option="1"]').exists('First option exists');
		assert.dom('[data-test-option="2"]').exists('Second option exists');
		assert.dom('[data-test-option="3"]').exists('Third option exists');
	});

	test('dropdown with complex content renders correctly', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <i class="fa fa-filter"></i>
            <span>Filters</span>
            <span class="badge">2</span>
            </:button>
            <:content>
            <a href="#">
                <span>Assigned to Me</span>
                <i class="fa fa-check"></i>
            </a>
            <a href="#">
                <span>In Progress</span>
                <i class="fa fa-check"></i>
            </a>
            </:content>
        </AppUi::Dropdown>
        `);

		assert.dom('.fa-filter').exists('Filter icon exists');
		assert.dom('.badge').exists('Badge exists');
		assert.dom('.badge').hasText('2', 'Badge shows correct count');
		assert
			.dom('.app-dropdown-content .fa-check')
			.exists({ count: 2 }, 'Check icons exist');
		assert
			.dom('.app-dropdown-content a')
			.exists({ count: 2 }, 'Two options exist');
	});

	test('dropdown button has proper styling classes', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <span>Menu</span>
            </:button>
            <:content>
            <a href="#">Option 1</a>
            </:content>
        </AppUi::Dropdown>
        `);

		assert.dom('.app-dropdown-btn').hasClass('btn', 'Button has btn class');
		assert
			.dom('.app-dropdown-btn')
			.hasClass('btn-primary', 'Button has btn-primary class');
		assert
			.dom('.app-dropdown-btn')
			.hasClass('app-dropdown-btn', 'Button has app-dropdown-btn class');
	});

	test('dropdown content has proper styling', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <span>Menu</span>
            </:button>
            <:content>
            <a href="#">Option 1</a>
            <a href="#">Option 2</a>
            </:content>
        </AppUi::Dropdown>
        `);

		assert
			.dom('.app-dropdown-content')
			.hasClass('app-dropdown-content', 'Content has proper class');

		// Check that content items have proper styling
		const contentItems = findAll('.app-dropdown-content a');
		assert.equal(contentItems.length, 2, 'Two content items exist');

		contentItems.forEach((item) => {
			assert
				.dom(item)
				.hasAttribute('href', '#', 'Items have href attribute');
		});
	});

	test('dropdown with no content still renders button', async function (assert) {
		await render(hbs`
        <AppUi::Dropdown>
            <:button>
            <span>Empty Menu</span>
            </:button>
            <:content>
            </:content>
        </AppUi::Dropdown>
        `);

		assert
			.dom('.app-dropdown-btn')
			.exists('Button exists even with no content');
		assert
			.dom('.app-dropdown-btn')
			.hasText('Empty Menu', 'Button text is rendered');
		assert
			.dom('.app-dropdown-content')
			.exists('Content container exists even when empty');
	});
});
