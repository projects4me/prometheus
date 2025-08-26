import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/toolbar', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders basic toolbar with content', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar>
				<button type="button" class="btn btn-primary">Action 1</button>
				<button type="button" class="btn btn-secondary">Action 2</button>
			</AppUi::Toolbar>
		`);

		assert.dom('.toolbar-container').exists('Toolbar container exists');
		assert
			.dom('.toolbar-actions')
			.exists('Toolbar actions container exists');
		assert.dom('.btn-primary').exists('Primary button exists');
		assert.dom('.btn-secondary').exists('Secondary button exists');
		assert
			.dom('.toolbar-caret-container')
			.doesNotExist(
				'Caret container should not exist when showCaret is false'
			);
	});

	test('it renders toolbar with caret dropdown when showCaret is true', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar @showCaret={{true}}>
				<:primary>
					<button type="button" class="btn btn-primary">Primary Action</button>
				</:primary>
				<:dropdown>
					<a href="#" class="dropdown-item">Dropdown Item 1</a>
					<a href="#" class="dropdown-item">Dropdown Item 2</a>
				</:dropdown>
			</AppUi::Toolbar>
		`);

		assert.dom('.toolbar-container').exists('Toolbar container exists');
		assert.dom('.toolbar-caret-container').exists('Caret container exists');
		assert.dom('.toolbar-caret-btn').exists('Caret button exists');
		assert.dom('.fa-caret-down').exists('Caret down icon exists');
		assert.dom('.toolbar-dropdown').exists('Dropdown content exists');
		assert
			.dom('.dropdown-item')
			.exists({ count: 2 }, 'Two dropdown items exist');
	});

	test('caret dropdown toggles visibility when clicked', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar @showCaret={{true}}>
				<:primary>
					<button type="button" class="btn btn-primary">Primary Action</button>
				</:primary>
				<:dropdown>
					<a href="#" class="dropdown-item">Dropdown Item 1</a>
					<a href="#" class="dropdown-item">Dropdown Item 2</a>
				</:dropdown>
			</AppUi::Toolbar>
		`);

		// Initially dropdown should be hidden
		assert
			.dom('.toolbar-dropdown')
			.doesNotHaveClass('show', 'Dropdown is initially hidden');

		// Click caret button to open dropdown
		await click('.toolbar-caret-btn');
		assert
			.dom('.toolbar-dropdown')
			.hasClass('show', 'Dropdown is shown after clicking caret');

		// Click caret button again to close dropdown
		await click('.toolbar-caret-btn');
		assert
			.dom('.toolbar-dropdown')
			.doesNotHaveClass(
				'show',
				'Dropdown is hidden after clicking caret again'
			);
	});

	test('caret icon rotates when dropdown is opened', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar @showCaret={{true}}>
				<:primary>
					<button type="button" class="btn btn-primary">Primary Action</button>
				</:primary>
				<:dropdown>
					<a href="#" class="dropdown-item">Dropdown Item 1</a>
				</:dropdown>
			</AppUi::Toolbar>
		`);

		const caretBtn = find('.toolbar-caret-btn');
		const caretIcon = find('.toolbar-caret-btn i');

		// Initially caret should not be rotated and aria-expanded should be false
		assert
			.dom(caretBtn)
			.hasAttribute(
				'aria-expanded',
				'false',
				'Initially aria-expanded is false'
			);
		assert
			.dom(caretBtn)
			.hasAttribute(
				'aria-haspopup',
				'true',
				'aria-haspopup is set correctly'
			);
		assert
			.dom(caretIcon)
			.hasClass('fa-caret-down', 'Caret icon has correct initial class');

		// Click to open dropdown
		await click('.toolbar-caret-btn');
		assert
			.dom(caretBtn)
			.hasAttribute(
				'aria-expanded',
				'true',
				'aria-expanded is true when dropdown is open'
			);
		assert
			.dom('.toolbar-dropdown')
			.hasClass('show', 'Dropdown has show class when open');
		// Note: CSS rotation is handled by aria-expanded="true" attribute

		// Click to close dropdown
		await click('.toolbar-caret-btn');
		assert
			.dom(caretBtn)
			.hasAttribute(
				'aria-expanded',
				'false',
				'aria-expanded is false when dropdown is closed'
			);
		assert
			.dom('.toolbar-dropdown')
			.doesNotHaveClass(
				'show',
				'Dropdown does not have show class when closed'
			);
	});

	test('toolbar with icon-only dropdown items renders correctly', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar @showCaret={{true}}>
				<:primary>
					<button type="button" class="btn btn-primary">Primary Action</button>
				</:primary>
				<:dropdown>
					<a href="#" class="dropdown-item">
						<i class="fa fa-copy"></i>
					</a>
					<a href="#" class="dropdown-item">
						<i class="fa fa-download"></i>
					</a>
					<a href="#" class="dropdown-item">
						<i class="fa fa-trash"></i>
					</a>
				</:dropdown>
			</AppUi::Toolbar>
		`);

		assert.dom('.toolbar-dropdown .fa-copy').exists('Copy icon exists');
		assert
			.dom('.toolbar-dropdown .fa-download')
			.exists('Download icon exists');
		assert.dom('.toolbar-dropdown .fa-trash').exists('Trash icon exists');
		assert
			.dom('.toolbar-dropdown a')
			.exists({ count: 3 }, 'Three dropdown items exist');
	});

	test('backward compatibility - toolbar without showCaret renders content directly', async function (assert) {
		await render(hbs`
			<AppUi::Toolbar>
				<button type="button" class="btn btn-primary">Action 1</button>
				<button type="button" class="btn btn-secondary">Action 2</button>
			</AppUi::Toolbar>
		`);

		assert.dom('.toolbar-container').exists('Toolbar container exists');
		assert.dom('.btn-primary').exists('Primary button exists');
		assert.dom('.btn-secondary').exists('Secondary button exists');
		assert
			.dom('.toolbar-caret-container')
			.doesNotExist('Caret container should not exist');
		assert
			.dom('.toolbar-dropdown')
			.doesNotExist('Dropdown should not exist');
	});
});
