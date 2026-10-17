import { click, fillIn, settled, waitUntil } from '@ember/test-helpers';
import Sortable from 'sortablejs';
import steps from '../steps';

const TABLE = '[data-issue-statuses-table]';

/**
 * Finds the table row of the global issue status with the given key.
 */
function findRow(name) {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-issue-status]`)]
        .find(row => row.querySelector('[data-column="key"]').textContent.trim() === name);
}

function listedKeys() {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-issue-status] [data-column="key"]`)]
        .map(cell => cell.textContent.trim());
}

function splitNames(names) {
    return names.split(',').map(name => name.trim());
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

/**
 * Normalises the colour of a row label, browsers report it as rgb().
 */
function hexOf(element) {
    let [r, g, b] = getComputedStyle(element).backgroundColor.match(/\d+/g).map(Number);
    return '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('');
}

export const given = function () {
    return [
        {
            "The global issue statuses are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('issuestatus', {
                        name: row.name,
                        color: row.color,
                        done: row.done,
                        sortOrder: parseInt(row.sortOrder),
                        issueCount: parseInt(row.issueCount),
                        system: '1'
                    });
                });
                assert.ok(true, `${table.length} global issue statuses exist`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User adds the issue status $name with colour $color counting as done": (assert) => async function (name, color) {
                await click('[data-btn="add-issue-status"]');
                await fillIn('.modal [data-field="issuestatus.name"] input', name);
                await click(`.modal [data-field="issuestatus.color"] input[value="${color}"]`);
                await click('.modal [data-field="issuestatus.done"] input');
                await submitModal();
                assert.ok(true, `User adds the issue status ${name}`);
            }
        },
        {
            "User changes the colour of the issue status $name to $color": (assert) => async function (name, color) {
                await click(findRow(name).querySelector('[data-btn="edit-issue-status"]'));
                await click(`.modal [data-field="issuestatus.color"] input[value="${color}"]`);
                await submitModal();
                assert.ok(true, `User recolours the issue status ${name}`);
            }
        },
        {
            "User drags the issue status $name to position $position": (assert) => async function (name, position) {
                // Reports the move the way SortableJS does when a row is dropped.
                let body = document.querySelector(`${TABLE} tbody`);
                let item = findRow(name);
                let oldIndex = [...body.children].indexOf(item);
                Sortable.get(body).option('onEnd')({
                    item,
                    from: body,
                    oldIndex,
                    newIndex: parseInt(position) - 1
                });
                await settled();
                assert.ok(true, `User drags the issue status ${name} to position ${position}`);
            }
        },
        {
            "User deletes the issue status $name": (assert) => async function (name) {
                await click(findRow(name).querySelector('[data-btn="delete-issue-status"]'));
                await click(await waitForMessenger('[data-action="confirm"] a'));
                await waitUntil(() => !findRow(name));
                await settled();
                assert.ok(true, `User deletes the issue status ${name}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The issue statuses are listed in the order $names": (assert) => async function (names) {
                assert.deepEqual(listedKeys(), splitNames(names), 'listed order');
            }
        },
        {
            "The issue status $name is listed with colour $color, counting as done $done and $count issues": (assert) => async function (name, color, done, count) {
                let row = findRow(name);
                assert.ok(row, `${name} is listed`);
                assert.equal(hexOf(row.querySelector('[data-column="label"] .label')), color);
                assert.equal(row.querySelector('[data-column="done"]').textContent.trim(), done);
                assert.equal(row.querySelector('[data-column="issueCount"]').textContent.trim(), count);
            }
        },
        {
            "The saved sort order of the issue statuses is $names": (assert) => async function (names) {
                let savedOrder = () => server.schema.issuestatuses
                    .where(status => status.system === '1' && typeof status.issueCount === 'number').models
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(status => status.name);
                let expected = splitNames(names);

                // The new order is saved by one request per moved status, after the page re-rendered.
                await waitUntil(() => savedOrder().join() === expected.join(), { timeout: 2000 });
                let saved = savedOrder();
                assert.deepEqual(saved, expected, 'saved order');
            }
        },
        {
            "Deleting the issue status $name is disabled with an explanation": (assert) => async function (name) {
                let button = findRow(name).querySelector('[data-btn="delete-issue-status"]');
                assert.ok(button.disabled, 'The delete button is disabled');
                assert.ok(button.title.includes('cannot be deleted'), 'The title explains why');
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
