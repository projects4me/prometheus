/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, currentURL, fillIn, focus, settled, visit } from '@ember/test-helpers';
import Settings from '../../../../mirage/helpers/acl-settings';
import steps from '../steps';
import { runSearch } from '../ez-search-run';

const BROWSER = '[data-role-browser]';
const INPUT = `${BROWSER} [data-field="ez-search-input"] input, ${BROWSER} input[data-field="ez-search-input"]`;

/**
 * The role of the given name in the Mirage database
 *
 * @param {String} name
 * @returns {Object}
 */
function roleNamed(name) {
    return server.schema.roles.findBy({ name });
}

/**
 * The browser row of the role of the given name
 *
 * @param {String} name
 * @returns {String} Its selector
 */
function rowOf(name) {
    return `${BROWSER} [data-role="${roleNamed(name).id}"]`;
}

/**
 * The names of the listed roles, in the order shown
 *
 * @returns {Array<String>}
 */
function listedNames() {
    return [...document.querySelectorAll(`${BROWSER} [data-role-field="name"]`)].map(el => el.textContent.trim());
}

/**
 * The resource names of the action permissions of the ACL catalog
 *
 * @returns {Array<String>}
 */
function catalogActions() {
    return JSON.parse(Settings.aclSettings.moduleActions)
        .flatMap(entry => (entry.actions || []).map(action => action.resourceName))
        .filter(name => name && name.split('.').length === 2);
}

export const given = function () {
    return [
        {
            "The roles in the system are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('role', {
                        name: row.name,
                        description: row.description === '-' ? '' : row.description,
                        dateModified: row.dateModified
                    });
                });
                assert.ok(true, `${table.length} roles exist`);
            }
        },
        {
            "There are $count roles named in order": (assert) => async function (count) {
                for (let i = 1; i <= Number(count); i++) {
                    server.create('role', { name: `Role ${String(i).padStart(2, '0')}` });
                }
                assert.ok(true, `${count} roles exist`);
            }
        },
        {
            "Role $name denies $resource": (assert) => async function (name, resource) {
                server.create('permission', { roleId: String(roleNamed(name).id), resourceName: resource, allowed: '0' });
                assert.ok(true, `${name} denies ${resource}`);
            }
        },
        {
            "Role $name denies every action": (assert) => async function (name) {
                let roleId = String(roleNamed(name).id);
                catalogActions().forEach(resourceName => {
                    server.create('permission', { roleId, resourceName, allowed: '0' });
                });
                assert.ok(true, `${name} denies every action`);
            }
        },
        {
            "Role $name has $count members": (assert) => async function (name, count) {
                let role = roleNamed(name);
                let users = server.schema.users.all().models;
                if (users.length < Number(count)) {
                    server.createList('user', Number(count) - users.length);
                    users = server.schema.users.all().models;
                }
                for (let i = 0; i < Number(count); i++) {
                    server.create('userrole', { roleId: String(role.id), userId: users[i].id, user: users[i] });
                }
                assert.ok(true, `${name} has ${count} members`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User opens the roles page": (assert) => async function () {
                await visit('/app/role');
                assert.ok(currentURL().startsWith('/app/role'), `User opens the roles page: ${currentURL()}`);
            }
        },
        {
            "User opens the roles page with the search $query": (assert) => async function (query) {
                await visit(`/app/role?query=${encodeURIComponent(query)}`);
                assert.ok(currentURL().startsWith('/app/role'), currentURL());
            }
        },
        {
            "User opens the role $name": (assert, ctx) => async function (name) {
                ctx.set('roleRequestsBefore', (ctx.get('roleRequests') || []).length);
                await click(rowOf(name));
                assert.ok(true, `User opens the role ${name}`);
            }
        },
        {
            'User types "$text" in the role search bar and presses Enter': (assert) => async function (text) {
                await focus(INPUT);
                await fillIn(INPUT, text);
                await runSearch(INPUT);
                await settled();
            }
        },
        {
            "User opens the next page of the role browser": (assert) => async function () {
                await click(`${BROWSER} [data-quick-list-pagination-next]`);
                assert.ok(true, 'the next page is requested');
            }
        },
        {
            "User groups the role browser by $key": (assert) => async function (key) {
                await click(`${BROWSER} .quick-list-toolbar-group .app-dropdown-btn`);
                await click(`${BROWSER} [data-test-group-option="${key}"]`);
                assert.ok(true, `User groups the role browser by ${key}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The role $name is open": (assert) => async function (name) {
                let id = roleNamed(name).id;
                assert.ok(currentURL().startsWith(`/app/role/${id}`), `${currentURL()} opens ${name}`);
                assert.dom(`${rowOf(name)}.quick-list-item--active`).exists(`${name} is the active row`);
            }
        },
        {
            "The role $name stays open": (assert) => async function (name) {
                let id = roleNamed(name).id;
                assert.ok(currentURL().startsWith(`/app/role/${id}`), `${currentURL()} keeps ${name} open`);
            }
        },
        {
            "The role browser lists $names": (assert) => async function (names) {
                assert.deepEqual(listedNames(), names.split(', '));
            }
        },
        {
            "The role browser lists $count roles": (assert) => async function (count) {
                assert.dom(`${BROWSER} [data-test-quick-list-item]`).exists({ count: Number(count) });
            }
        },
        {
            "The role row $name shows the initials $initials": (assert) => async function (name, initials) {
                assert.dom(`${rowOf(name)} [data-role-field="initials"]`).hasText(initials);
            }
        },
        {
            "The role row $name shows $percent granted and no denied": (assert) => async function (name, percent) {
                assert.dom(`${rowOf(name)} [data-role-field="granted"]`).hasText(percent);
                assert.dom(`${rowOf(name)} [data-role-field="denied"]`).doesNotExist();
            }
        },
        {
            "The role row $name shows a denied share": (assert) => async function (name) {
                let granted = document.querySelector(`${rowOf(name)} [data-role-field="granted"]`).textContent.trim();
                let denied = document.querySelector(`${rowOf(name)} [data-role-field="denied"]`).textContent.trim();
                let grantedPercent = parseInt(granted, 10);
                assert.ok(grantedPercent < 100, `granted ${granted}`);
                assert.strictEqual(denied, `${100 - grantedPercent}% denied`);
            }
        },
        {
            "The role row $name shows the description $text": (assert) => async function (name, text) {
                assert.dom(`${rowOf(name)} [data-role-field="description"]`).hasText(text);
            }
        },
        {
            "The role row $name shows no description": (assert) => async function (name) {
                assert.dom(`${rowOf(name)} [data-role-field="description"]`).hasText('No description');
                assert.dom(`${rowOf(name)} [data-role-field="description"]`).hasClass('role-row__description--empty');
            }
        },
        {
            "The role row $name shows $count avatars and $more more": (assert) => async function (name, count, more) {
                assert.dom(`${rowOf(name)} .member-avatar`).exists({ count: Number(count) });
                assert.dom(`${rowOf(name)} .member-avatars-overflow`).hasText(`+${more}`);
            }
        },
        {
            "The role row $name shows no members": (assert) => async function (name) {
                assert.dom(`${rowOf(name)} [data-role-field="members"]`).hasText('No members');
            }
        },
        {
            "The role row $name shows the date $date": (assert) => async function (name, date) {
                assert.dom(`${rowOf(name)} [data-role-field="dateModified"]`).hasText(date);
            }
        },
        {
            "The role browser count reads $text": (assert) => async function (text) {
                assert.dom(`${BROWSER} [data-test-quick-list-count]`).hasText(text);
            }
        },
        {
            "The role list was requested with \"$text\"": (assert, ctx) => async function (text) {
                let sent = (ctx.get('roleRequests') || []).map(params => params.query || '');
                assert.ok(sent.some(query => query.includes(text)), `sent ${sent.join(' | ')}`);
            }
        },
        {
            "The role url keeps $param": (assert) => async function (param) {
                assert.ok(currentURL().includes(`${param}=`), currentURL());
            }
        },
        {
            "The role list was not requested again": (assert, ctx) => async function () {
                assert.strictEqual((ctx.get('roleRequests') || []).length, ctx.get('roleRequestsBefore'));
            }
        },
        {
            "The member query of the role browser names only the listed roles": (assert, ctx) => async function () {
                let queries = ctx.get('userroleRoleQueries') || [];
                let last = queries[queries.length - 1] || '';
                let listed = [...document.querySelectorAll(`${BROWSER} [data-role]`)].map(el => el.getAttribute('data-role'));
                let asked = [...last.matchAll(/Userrole\.roleId : (\w+)/g)].map(match => match[1]);
                assert.deepEqual(asked.sort(), listed.sort(), last);
            }
        },
        {
            "The next page button of the role browser is $state": (assert) => async function (state) {
                let next = `${BROWSER} [data-quick-list-pagination-next]`;
                state === 'enabled' ? assert.dom(next).isNotDisabled() : assert.dom(next).isDisabled();
            }
        },
        {
            "The role browser shows the groups $keys": (assert) => async function (keys) {
                let shown = [...document.querySelectorAll(`${BROWSER} [data-test-quick-list-group]`)]
                    .map(el => el.getAttribute('data-test-quick-list-group'));
                assert.deepEqual(shown, keys.split(', '));
            }
        },
        {
            "The roles page tells that no role matches": (assert) => async function () {
                assert.strictEqual(currentURL().split('?')[0], '/app/role');
                assert.dom('[data-role-no-match]').hasText('No roles match this search');
            }
        },
        {
            "The first listed role is open": (assert) => async function () {
                let first = document.querySelector(`${BROWSER} [data-role]`);
                assert.ok(first, 'a role is listed');
                let id = first.getAttribute('data-role');
                assert.ok(currentURL().startsWith(`/app/role/${id}`), `${currentURL()} opens role ${id}`);
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
