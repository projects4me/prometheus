import { currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
        {
            "$userName has $entity permission set to $allowed": (assert, ctx) => async function (userName, entity, allowed) {
                let user = server.schema.users.find(userName.slice(-1));
                let permission = server.create('userpermission', {
                    userId: user.id,
                    entity: entity,
                    allowed: allowed
                });

                user.update({ aclPermissions: [...user.aclPermissions.models, permission] });
                ctx.set('currentUser', user);
                assert.ok(true, `${userName} has ${entity} permission set to ${allowed}`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens $page": (assert) => async function (page) {
                await visit(`/${page}`);
                assert.ok(true, `User opens /${page}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "User lands on $page": (assert) => async function (page) {
                assert.equal(currentURL(), `/${page}`, `User lands on /${page}`);
            }
        },
        {
            "The sidebar shows the Settings entry": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Settings"]').exists();
            }
        },
        {
            "The sidebar does not show the Settings entry": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Settings"]').doesNotExist();
            }
        },
        {
            "The sidebar does not show the Users and Roles entries": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="User"]').doesNotExist();
                assert.dom('.sidebar-menu [data-navigation-module="Role"]').doesNotExist();
            }
        },
        {
            "The settings navigation shows the $item page": (assert) => async function (item) {
                assert.dom(`.settings-nav [data-settings-item="${item}"]`).exists();
            }
        },
        {
            "The settings navigation highlights the $item page": (assert) => async function (item) {
                assert.dom('.settings-nav li.active').exists({ count: 1 });
                assert.dom(`.settings-nav [data-settings-item="${item}"]`).hasClass('active');
            }
        },
        {
            "The breadcrumb reads $trail": (assert) => async function (trail) {
                let items = [...document.querySelectorAll('.breadcrumb li')].map(li => li.textContent.trim());
                assert.equal(items.join(' > '), trail, `The breadcrumb reads ${trail}`);
            }
        },
        {
            "The access denied page is shown": (assert) => async function () {
                assert.dom('.error-page .headline').hasText('403');
                assert.dom('.settings-nav').doesNotExist();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
