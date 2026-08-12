import steps from '../steps';
import { click, fillIn, currentURL, settled, getContext } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert)
        .when('User clicks on View All members', async function () {
            await click('[data-btn="view-all-members"]');
            assert.ok(true, 'User clicks on View All members');
        })
        .when('User searches role members for $query', async function (query) {
            await fillIn('[data-field="search role members"]', query);
            assert.ok(true, `User searches role members for ${query}`);
        })
        .when('User clears role members search', async function () {
            await fillIn('[data-field="search role members"]', '');
            assert.ok(true, 'User clears role members search');
        })
        .when('User closes View All members modal', async function () {
            assert.dom('[data-role="role-members-view-all"]').exists();
            let { owner } = getContext();
            owner.lookup('controller:app.role.page').send('removeViewAllMembersModal');
            await settled();
            assert.ok(true, 'User closes View All members modal');
        })
        .then('There should $count userroles exists', async function (count) {
            assert.dom('[data-role="user-userroles"] li[data-role-userrole-id]').exists({
                count: parseInt(count, 10)
            });
        })
        .then('View All members control should be visible', async function () {
            assert.dom('[data-btn="view-all-members"]').exists({ count: 1 });
        })
        .then('View All members control should not be visible', async function () {
            assert.dom('[data-btn="view-all-members"]').doesNotExist();
        })
        .then('View All members modal should show $count userroles', async function (count) {
            assert.dom('[data-role="role-members-view-all-list"] li[data-role-userrole-id]').exists({
                count: parseInt(count, 10)
            });
        })
        .then('View All members modal should show empty state', async function () {
            assert.dom('[data-role="role-members-view-all-list"] li[data-role-userrole-id]').doesNotExist();
            assert.dom('[data-role="role-members-view-all"] .no-content').exists();
        })
        .then('View All members modal should be closed', async function () {
            assert.dom('[data-role="role-members-view-all"]').doesNotExist();
        })
        .then('User should still be on role detail page $roleId', async function (roleId) {
            assert.equal(
                currentURL(),
                `/app/role/${roleId}`,
                `User remains on role detail page ${roleId}`
            );
        });
}
