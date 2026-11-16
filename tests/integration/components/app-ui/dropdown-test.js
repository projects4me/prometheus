import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, triggerKeyEvent } from '@ember/test-helpers';
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
		assert.dom('.fa-caret-down').exists('Caret icon exists');
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
        <AppUi::Dropdown
        @isPrimary={{true}}
        >
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

	module('alignment and Escape', function (hooks) {
		let originalRect;
		let originalWidth;
		let originalHeight;

		// Stubs the sizes: the trigger sits at `trigger`, the menu measures `menu`, in a 1000x800 viewport.
		function stub(trigger, menu) {
			Element.prototype.getBoundingClientRect = function () {
				let box = this.classList.contains('app-dropdown-content') ? menu : this.classList.contains('app-dropdown-btn') ? trigger : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
				return { ...box, right: box.left + box.width, bottom: box.top + box.height };
			};
		}

		hooks.beforeEach(function () {
			originalRect = Element.prototype.getBoundingClientRect;
			originalWidth = window.innerWidth;
			originalHeight = window.innerHeight;
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
			Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
		});

		hooks.afterEach(function () {
			Element.prototype.getBoundingClientRect = originalRect;
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
			Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight });
		});

		async function open(align = '') {
			this.set('align', align || undefined);
			await render(hbs`
				<AppUi::Dropdown @align={{this.align}}>
					<:button>Menu</:button>
					<:content><a href="#">One</a></:content>
				</AppUi::Dropdown>
			`);
			await click('.app-dropdown-btn');
		}

		test('start and end are applied as given', async function (assert) {
			stub({ left: 10, top: 10, width: 50, height: 30 }, { left: 10, top: 40, width: 200, height: 100 });
			await open.call(this, 'end');
			assert.dom('.app-dropdown-content').hasClass('is-end');
			await click('.app-dropdown-btn');
			await open.call(this, 'start');
			assert.dom('.app-dropdown-content').hasClass('is-start');
		});

		test('auto picks start when the menu fits to the right', async function (assert) {
			stub({ left: 10, top: 10, width: 50, height: 30 }, { left: 10, top: 40, width: 200, height: 100 });
			await open.call(this);
			assert.dom('.app-dropdown-content').hasClass('is-start').doesNotHaveClass('is-up');
		});

		test('auto flips to end at the right edge and opens upward near the bottom', async function (assert) {
			stub({ left: 900, top: 740, width: 50, height: 30 }, { left: 900, top: 770, width: 200, height: 100 });
			await open.call(this);
			assert.dom('.app-dropdown-content').hasClass('is-end').hasClass('is-up');
		});

		test('Escape closes the menu and returns the focus to the trigger', async function (assert) {
			stub({ left: 10, top: 10, width: 50, height: 30 }, { left: 10, top: 40, width: 200, height: 100 });
			await open.call(this);
			assert.dom('.app-dropdown-content').hasClass('show');
			await triggerKeyEvent(document, 'keydown', 'Escape');
			assert.dom('.app-dropdown-content').doesNotHaveClass('show');
			assert.dom('.app-dropdown-btn').isFocused();
		});
	});
});
