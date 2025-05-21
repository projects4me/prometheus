import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
	'Integration | Component | app-ui/notifications/notification-tag-parser',
	function (hooks) {
		setupRenderingTest(hooks);

		test('it renders content with no tags unchanged', async function (assert) {
			this.set('notification', {
				description: 'This is a simple notification without tags'
			});

			await render(
				hbs`<AppUi::Notifications::NotificationTagParser @notification={{this.notification}} />`
			);

			assert
				.dom('[data-test-notification-tag-parser]')
				.hasText(
					'This is a simple notification without tags',
					'Plain content is rendered correctly'
				);
		});

		test('it renders module tags with appropriate HTML', async function (assert) {
			this.set('notification', {
				description:
					'User {{User@123}} created project {{Project@456}}',
				context: {
					userId: '123',
					userName: 'John Doe',
					projectShortcode: 'PRJ',
					projectName: 'Test Project'
				}
			});

			await render(
				hbs`<AppUi::Notifications::NotificationTagParser @notification={{this.notification}} />`
			);

			const tagParserElement = this.element.querySelector(
				'[data-test-notification-tag-parser]'
			);
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
			this.set('notification', {
				description:
					'Issue changed to {{status:open}} with {{priority:high}}',
				context: {}
			});

			await render(
				hbs`<AppUi::Notifications::NotificationTagParser @notification={{this.notification}} />`
			);

			const tagParserElement = this.element.querySelector(
				'[data-test-notification-tag-parser]'
			);
			assert
				.dom('span.badge.open', tagParserElement)
				.exists('Status badge is rendered');
			assert
				.dom('span.badge.open', tagParserElement)
				.hasText('open', 'Status badge has correct text');
			assert
				.dom('span.priority-tag.high', tagParserElement)
				.exists('Priority tag is rendered');
			assert
				.dom('span.priority-tag.high', tagParserElement)
				.hasText('high', 'Priority tag has correct text');
		});

		test('it handles unknown module tags gracefully', async function (assert) {
			this.set('notification', {
				description: 'Unknown module {{UnknownModule@123}}',
				context: {}
			});

			await render(
				hbs`<AppUi::Notifications::NotificationTagParser @notification={{this.notification}} />`
			);

			assert
				.dom('[data-test-notification-tag-parser]')
				.hasText(
					'Unknown module UnknownModule 123',
					'Unknown module is rendered as text'
				);
		});

		test('it handles missing context data gracefully', async function (assert) {
			this.set('notification', {
				description: 'User {{User@123}} did something'
			});
			await render(
				hbs`<AppUi::Notifications::NotificationTagParser @notification={{this.notification}} />`
			);
			assert
				.dom('[data-test-notification-tag-parser]')
				.exists(
					'Component renders without errors with missing context data'
				);
		});
	}
);
