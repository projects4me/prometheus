import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import NotificationsStub from '../../../stub-services/notifications-stub';
import CurrentUserStub from '../../../stub-services/current-user-stub';

/**
 * Current user stub with the id the recipient records below belong to
 */
class SignedInUserStub extends CurrentUserStub {
	user = { id: '1', name: 'Rana Nouman' };
}

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
			this.owner.register('service:current-user', SignedInUserStub);
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

		test('shows the issue key heading and all notifications without interaction', async function (assert) {
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('h5.notification-group-heading').exists();
			assert.dom('[data-notification-group-key]').hasText('TEST-5');
			assert.dom('.notification-group-heading .fa-ticket').exists();
			assert.dom('[data-notification]').exists({ count: 2 });
			assert.dom('[data-notification-group-count]').doesNotExist();
			assert.dom('[data-notification-group-unread]').doesNotExist();
			assert
				.dom('[data-notification-group-items]')
				.hasClass('notifications-list');
		});

		test('single notification group still has a heading', async function (assert) {
			this.set('group', {
				...this.group,
				notifications: [item('1', '0', new Date())]
			});
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('[data-notification-group-heading]').exists();
			assert.dom('[data-notification]').exists({ count: 1 });
		});

		test('heading links to the issue and marks all its unread notifications read', async function (assert) {
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert
				.dom('[data-notification-group-link]')
				.hasAttribute('href', '/app/project/test/issue/5');
			assert.dom('.unread-notification').exists({ count: 1 });
			await click('[data-notification-group-link]');
			assert.dom('.unread-notification').doesNotExist();
		});

		test('heading button marks the group read without leaving and hides when all are read', async function (assert) {
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert
				.dom('[data-notification-group-mark-read]')
				.hasAttribute('title', 'Mark as read');
			await click('[data-notification-group-mark-read]');
			assert.dom('.unread-notification').doesNotExist();
		});

		test("the heading button follows the current user's records, not the first one", async function (assert) {
			const shared = (id, mine, theirs) => ({
				...item(id, mine, new Date()),
				recipientRecords: [
					{ userId: '2', isRead: theirs },
					{ userId: '1', isRead: mine }
				]
			});
			this.set('group', {
				...this.group,
				notifications: [shared('1', '1', '0')]
			});
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('[data-notification-group-mark-read]').doesNotExist('read for me');

			this.set('group', {
				...this.group,
				notifications: [shared('1', '0', '1')]
			});
			await settled();
			assert.dom('[data-notification-group-mark-read]').exists('unread for me');
		});

		test('no heading button when every notification is read', async function (assert) {
			this.set('group', {
				...this.group,
				notifications: [item('1', '1', new Date())]
			});
			await render(
				hbs`<AppUi::Notifications::Group @group={{this.group}} />`
			);
			assert.dom('[data-notification-group-mark-read]').doesNotExist();
		});
	}
);
