import { click, fillIn, settled, waitUntil } from '@ember/test-helpers';
import steps from '../steps';

/**
 * Finds the table row of the default issue type with the given name.
 */
function findRow(name) {
    return [...document.querySelectorAll('[data-issue-types-table] tbody tr[data-issue-type]')]
        .find(row => row.querySelector('[data-column="name"]').textContent.trim() === name);
}

/**
 * Messenger renders outside the testing root, so waitFor cannot see it.
 */
function waitForMessenger(selector) {
    return waitUntil(() => document.querySelector(selector));
}

async function submitModal() {
    await click('.modal .btn-primary');
    await settled();
}

export const given = function () {
    return [
        {
            "The default issue types are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('issuetype', {
                        name: row.name,
                        description: row.description,
                        projectCount: parseInt(row.projectCount),
                        system: '1',
                        projectId: null
                    });
                });
                assert.ok(true, `${table.length} default issue types exist`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User adds the issue type $name with description $description": (assert) => async function (name, description) {
                await click('[data-btn="add-issue-type"]');
                await fillIn('.modal [data-field="issuetype.name"] input', name);
                await fillIn('.modal [data-field="issuetype.description"] input', description);
                await submitModal();
                assert.ok(true, `User adds the issue type ${name}`);
            }
        },
        {
            "User saves a new issue type with only the description $description": (assert) => async function (description) {
                await click('[data-btn="add-issue-type"]');
                await fillIn('.modal [data-field="issuetype.description"] input', description);
                await submitModal();
                assert.ok(true, 'User saves a new issue type without a name');
            }
        },
        {
            "User renames the issue type $name to $newName": (assert) => async function (name, newName) {
                await click(findRow(name).querySelector('[data-btn="edit-issue-type"]'));
                await fillIn('.modal [data-field="issuetype.name"] input', newName);
                await submitModal();
                assert.ok(true, `User renames the issue type ${name} to ${newName}`);
            }
        },
        {
            "User deletes the issue type $name": (assert) => async function (name) {
                await click(findRow(name).querySelector('[data-btn="delete-issue-type"]'));
                await click(await waitForMessenger('[data-action="confirm"] a'));
                await waitUntil(() => !findRow(name));
                await settled();
                assert.ok(true, `User deletes the issue type ${name}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The issue types table lists $count types": (assert) => async function (count) {
                assert.equal(
                    document.querySelectorAll('[data-issue-types-table] tbody tr[data-issue-type]').length,
                    parseInt(count)
                );
            }
        },
        {
            "The issue type $name is listed with description $description and $count projects using it": (assert) => async function (name, description, count) {
                let row = findRow(name);
                assert.ok(row, `${name} is listed`);
                assert.equal(row.querySelector('[data-column="description"]').textContent.trim(), description);
                assert.equal(row.querySelector('[data-column="projectCount"]').textContent.trim(), count);
            }
        },
        {
            "The issue type $name is not listed": (assert) => async function (name) {
                assert.notOk(findRow(name), `${name} is not listed`);
            }
        },
        {
            "The issue types info note is shown": (assert) => async function () {
                assert.dom('[data-issue-types-info]').exists();
            }
        },
        {
            "A validation error is shown": (assert) => async function () {
                await waitForMessenger('ul.messenger .message-error');
                assert.ok(document.querySelector('ul.messenger .message-error'), 'A validation error is shown');
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
