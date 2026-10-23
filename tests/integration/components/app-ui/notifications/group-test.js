import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import NotificationsStub from '../../../stub-services/notifications-stub';
import CurrentUserStub from '../../../stub-services/current-user-stub';

const item = (id, isRead, date) => ({
	id,
	description: `Update ${id}`,
	context: { relatedTo: 'issue', projectShortcode: 'TEST', issueNumber: '5' },
	recipientRecords: [{ userId: '1', isRead }],
	dateCreated: date,
	createdUser: 'user1',
	createdUserName: 'Test User'
});

module(
	'Integration | Component | app-ui/notifications/group',
	function (hooks) {
		setupRenderingTest(hooks);

		hooks.beforeEach(function () {
			this.owner.register('service:notifications', NotificationsStub);
			this.owner.register('service:current-user', CurrentUserStub);
			this.set('group', {
				isGroup: true,
				key: 'test-5',
				shortcode: 'TEST',
				issueNumber: '5',
				notifications: [
					item('2', '0', new Date('2026-01-02')),
					item('1', '1', new Date('2026-01-01'))
				]
			});
		});

		test('collapsed by default with key, counts and unread style', async function (assert) {
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('[data-notification-group-key]').hasText('TEST-5');
			assert.dom('[data-notification-group-count]').includesText('2');
			assert.dom('[data-notification-group-unread]').includesText('1');
			assert
				.dom('[data-notification-group-header]')
				.hasClass('unread-notification');
			assert.dom('[data-notification]').doesNotExist();
		});

		test('toggles expansion and lists the notifications', async function (assert) {
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			await click('[data-notification-group-header]');
			assert.dom('[data-notification]').exists({ count: 2 });
			await click('[data-notification-group-header]');
			assert.dom('[data-notification]').doesNotExist();
		});

		test('all read group has no unread style', async function (assert) {
			this.group.notifications.forEach(
				(x) => (x.recipientRecords[0].isRead = '1')
			);
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert
				.dom('[data-notification-group-header]')
				.doesNotHaveClass('unread-notification');
			assert.dom('[data-notification-group-unread]').doesNotExist();
		});

		test('single notification renders as a plain notification', async function (assert) {
			this.set('group', {
				...this.group,
				notifications: [item('1', '0', new Date())]
			});
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('[data-notification-group-header]').doesNotExist();
			assert.dom('[data-notification]').exists({ count: 1 });
		});
	}
);
