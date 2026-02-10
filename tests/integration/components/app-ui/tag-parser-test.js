import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/tag-parser', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders content with no tags unchanged', async function (assert) {
		this.set('content', 'This is a simple content without tags');
		this.set('context', {});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		assert
			.dom('[data-tag-parser]')
			.hasText(
				'This is a simple content without tags',
				'Plain content is rendered correctly'
			);
	});

	test('it renders module tags with appropriate HTML', async function (assert) {
		this.set('content', 'User {{User@123}} created project {{Project@456}}');
		this.set('context', {
			userId: '123',
			userName: 'John Doe',
			projectShortcode: 'PRJ',
			projectName: 'Test Project'
		});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		const tagParserElement = this.element.querySelector('[data-tag-parser]');
		assert
			.dom('a', tagParserElement)
			.exists({ count: 2 }, 'Two links are rendered');
		assert
			.dom('a:first-of-type', tagParserElement)
			.hasAttribute(
				'href',
				'/app/user/123',
				'User link has correct href'
			);
		assert
			.dom('a:first-of-type', tagParserElement)
			.hasText('John Doe', 'User link has correct text');
		assert
			.dom('a:last-of-type', tagParserElement)
			.hasAttribute(
				'href',
				'/app/project/prj',
				'Project link has correct href'
			);
		assert
			.dom('a:last-of-type', tagParserElement)
			.hasText('Test Project', 'Project link has correct text');
	});

	test('it renders field tags with appropriate HTML', async function (assert) {
		this.set('content', 'Issue changed to {{status:in_progress}} with {{priority:high}}');
		this.set('context', {});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		const tagParserElement = this.element.querySelector('[data-tag-parser]');
		assert
			.dom('span.badge.in_progress', tagParserElement)
			.exists('Status badge is rendered');
		assert
			.dom('span.badge.in_progress', tagParserElement)
			.hasText('In Progress', 'Status badge has correct text');
		assert
			.dom('span.priority-tag.high', tagParserElement)
			.exists('Priority tag is rendered');
		assert
			.dom('span.priority-tag.high', tagParserElement)
			.hasText('High', 'Priority tag has correct text');
	});

	test('it handles unknown module tags gracefully', async function (assert) {
		this.set('content', 'Unknown module {{UnknownModule@123}}');
		this.set('context', {});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		assert
			.dom('[data-tag-parser]')
			.hasText(
				'Unknown module UnknownModule 123',
				'Unknown module is rendered as text'
			);
	});

	test('it handles missing context data gracefully', async function (assert) {
		this.set('content', 'User {{User@123}} did something');
		this.set('context', {});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		assert
			.dom('[data-tag-parser]')
			.exists(
				'Component renders without errors with missing context data'
			);
	});

	test('it renders issue module tags correctly', async function (assert) {
		this.set('content', 'Issue {{Issue@789}} was created');
		this.set('context', {
			projectShortcode: 'PRJ',
			issueNumber: '789'
		});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		const tagParserElement = this.element.querySelector('[data-tag-parser]');
		assert
			.dom('a', tagParserElement)
			.exists('Issue link is rendered');
		assert
			.dom('a', tagParserElement)
			.hasAttribute(
				'href',
				'/app/project/prj/issue/789',
				'Issue link has correct href'
			);
		assert
			.dom('a', tagParserElement)
			.hasText('#789', 'Issue link has correct text');
	});

	test('it renders createdUser field tag correctly', async function (assert) {
		this.set('content', 'Created by {{createdUser:456}}');
		this.set('context', {});
		this.set('createdUserName', 'Jane Smith');

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} @createdUserName={{this.createdUserName}} />`
		);

		const tagParserElement = this.element.querySelector('[data-tag-parser]');
		assert
			.dom('a', tagParserElement)
			.exists('Created user link is rendered');
		assert
			.dom('a', tagParserElement)
			.hasAttribute(
				'href',
				'/app/user/456',
				'Created user link has correct href'
			);
		assert
			.dom('a', tagParserElement)
			.hasText('Jane Smith', 'Created user link has correct text');
	});

	test('it handles empty content gracefully', async function (assert) {
		this.set('content', '');
		this.set('context', {});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		assert
			.dom('[data-tag-parser]')
			.exists('Component renders without errors with empty content');
	});
});

