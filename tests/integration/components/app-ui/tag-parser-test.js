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

	test('it renders HTML in user values as text', async function (assert) {
		const payload = '<img src=x onerror="window.__xss=1">';
		this.set('content', 'U {{User@1}} P {{Project@2}} M {{Milestone@3}} C {{createdUser:456}} F {{note:abc}}');
		this.set('context', {
			userId: '1',
			userName: payload,
			projectShortcode: 'PRJ',
			projectName: payload,
			milestoneId: '3',
			milestoneName: payload
		});
		this.set('createdUserName', payload);

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} @createdUserName={{this.createdUserName}} />`
		);

		const el = this.element.querySelector('[data-tag-parser]');
		assert.dom('img', el).doesNotExist('No element is injected');
		assert.dom('a', el).exists({ count: 4 });
		assert.dom('a', el).hasText(payload);
		assert.notOk(window.__xss, 'No handler ran');
	});

	test('it renders HTML in issue subject, ids and tag text as text', async function (assert) {
		this.set('content', 'Subject <b>bold</b> {{Issue@1}} {{Comment@2}}');
		this.set('context', {
			projectShortcode: 'P"><i>x</i>',
			issueNumber: '1"><u>y</u>',
			commentId: '"><s>z</s>'
		});

		await render(
			hbs`<AppUi::TagParser @content={{this.content}} @context={{this.context}} />`
		);

		const el = this.element.querySelector('[data-tag-parser]');
		assert.dom('b, i, u, s', el).doesNotExist('Nothing is injected');
		assert.dom(el).includesText('Subject <b>bold</b>');
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

