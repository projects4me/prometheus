import { click, fillIn, settled, triggerEvent, waitUntil } from '@ember/test-helpers';
import Sortable from 'sortablejs';
import steps from '../steps';
import { translationsUrl } from 'prometheus/mirage/route-handlers/translation';

const TABLE = '[data-issue-statuses-table]';

/**
 * Finds the table row of the global issue status with the given value.
 */
function findRow(name) {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-issue-status]`)]
        .find(row => row.querySelector('[data-column="value"]').textContent.trim() === name);
}

function listedValues() {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-issue-status] [data-column="value"]`)]
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

function labelInput(locale) {
    return `.modal [data-field="issuestatus.label.${locale}"] input`;
}

const VALUE_INPUT = '.modal [data-field="issuestatus.name"] input';
const HEX_INPUT = '.modal [data-field="issuestatus.color.hex"] input';
const PICKER_INPUT = '.modal [data-field="issuestatus.color.picker"] input';

/**
 * Types a colour in the hex field of the dialog and leaves the field, so it is validated.
 */
async function typeColor(color) {
    await fillIn(HEX_INPUT, color);
    // The modal keeps the focus elsewhere, so the leave events are sent directly.
    await triggerEvent(HEX_INPUT, 'focusout');
    await triggerEvent(HEX_INPUT, 'blur');
}

/**
 * The create and update requests the page sent for issue statuses, per Mirage server.
 */
const sentWrites = new WeakMap();

/**
 * Starts recording the create and update requests of issue statuses; Mirage doesn't
 * keep them. The recorder is removed when the server shuts down.
 */
function recordWrites() {
    if (sentWrites.has(server)) {
        return;
    }

    let requests = [];
    let pretender = server.pretender;
    let handledRequest = pretender.handledRequest;
    pretender.handledRequest = function (verb, path, request) {
        if (['POST', 'PATCH'].includes(verb) && /\/issuestatus(\/[^/]+)?$/.test(path)) {
            requests.push(request);
        }
        return handledRequest.apply(this, arguments);
    };

    let shutdown = server.shutdown;
    server.shutdown = function () {
        pretender.handledRequest = handledRequest;
        server.shutdown = shutdown;
        return shutdown.apply(this, arguments);
    };

    sentWrites.set(server, requests);
}

function sentRequests(verb) {
    return (sentWrites.get(server) ?? []).filter(request => request.method === verb);
}

function createRequests() {
    return sentRequests('POST');
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
                        system: '1',
                        translations: row.label ? { 'en-us': row.label } : undefined
                    });
                });
                assert.ok(true, `${table.length} global issue statuses exist`);
            }
        },
        {
            "Gaia offers the locales $locales": (assert) => async function (locales) {
                server.get(translationsUrl(), () => splitNames(locales));
                assert.ok(true, `Gaia supports ${locales}`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User adds the issue status labelled $label with colour $color counting as done": (assert) => async function (label, color) {
                recordWrites();
                await click('[data-btn="add-issue-status"]');
                await fillIn(labelInput('en-us'), label);
                await typeColor(color);
                await click('.modal [data-field="issuestatus.done"] input');
                await submitModal();
                assert.ok(true, `User adds the issue status ${label}`);
            }
        },
        {
            "User creates the issue status $label": (assert) => async function (label) {
                recordWrites();
                await click('[data-btn="add-issue-status"]');
                await fillIn(labelInput('en-us'), label);
                await submitModal();
                assert.ok(true, `User adds the issue status ${label}`);
            }
        },
        {
            "User starts adding an issue status": (assert) => async function () {
                recordWrites();
                await click('[data-btn="add-issue-status"]');
                assert.ok(true, 'User opens the add dialog');
            }
        },
        {
            "User starts editing the issue status $name": (assert) => async function (name) {
                await click(findRow(name).querySelector('[data-btn="edit-issue-status"]'));
                assert.ok(true, `User opens the edit dialog of ${name}`);
            }
        },
        {
            "User types the $locale label $label": (assert) => async function (locale, label) {
                await fillIn(labelInput(locale), label);
                assert.ok(true, `User types the ${locale} label ${label}`);
            }
        },
        {
            "User types the value $value": (assert) => async function (value) {
                await fillIn(VALUE_INPUT, value);
                assert.ok(true, `User types the value ${value}`);
            }
        },
        {
            "User saves the issue status": (assert) => async function () {
                await submitModal();
                assert.ok(true, 'User saves the issue status');
            }
        },
        {
            "User changes the colour of the issue status $name to $color": (assert) => async function (name, color) {
                recordWrites();
                await click(findRow(name).querySelector('[data-btn="edit-issue-status"]'));
                await typeColor(color);
                await submitModal();
                assert.ok(true, `User recolours the issue status ${name}`);
            }
        },
        {
            "User types the colour $color": (assert) => async function (color) {
                await typeColor(color);
                assert.ok(true, `User types the colour ${color}`);
            }
        },
        {
            "User picks the colour $color with the colour picker": (assert) => async function (color) {
                await fillIn(PICKER_INPUT, color);
                assert.ok(true, `User picks the colour ${color}`);
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
                assert.deepEqual(listedValues(), splitNames(names), 'listed order');
            }
        },
        {
            "The issue statuses table has the columns $headings": (assert) => async function (headings) {
                let listed = [...document.querySelectorAll(`${TABLE} thead th`)]
                    .map(cell => cell.textContent.trim())
                    .filter(Boolean);
                assert.deepEqual(listed, splitNames(headings), 'column headings');
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
            "The issue status $name is listed with $tone label text": (assert) => async function (name, tone) {
                let label = findRow(name).querySelector('[data-column="label"] .label');
                let expected = tone === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
                assert.equal(getComputedStyle(label).color, expected, `${name} has ${tone} label text`);
            }
        },
        {
            "The colour picker and the hex field read $color": (assert) => async function (color) {
                assert.dom(PICKER_INPUT).hasValue(color);
                assert.dom(HEX_INPUT).hasValue(color);
            }
        },
        {
            "The colour preview reads $label in colour $color": (assert) => async function (label, color) {
                let preview = document.querySelector('.modal [data-field="issuestatus.color.preview"] .label');
                assert.equal(preview.textContent.trim(), label);
                assert.equal(hexOf(preview), color);
            }
        },
        {
            "The colour field shows the message $message": (assert) => async function (message) {
                assert.dom('.modal [data-field="issuestatus.color.hex"] .error').hasText(message);
            }
        },
        {
            "One request created the issue status $name with the colour $color": (assert) => async function (name, color) {
                let requests = createRequests();
                assert.strictEqual(requests.length, 1, 'one create request');

                let attributes = JSON.parse(requests[0].requestBody).data.attributes;
                assert.strictEqual(attributes.name, name);
                assert.strictEqual(attributes.color, color);
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
            "The dialog has a label field for $locales": (assert) => async function (locales) {
                let fields = [...document.querySelectorAll('.modal [data-field^="issuestatus.label."]')]
                    .map(field => field.dataset.field.replace('issuestatus.label.', ''));
                assert.deepEqual(fields, splitNames(locales), 'label fields');
            }
        },
        {
            "The value reads $value": (assert) => async function (value) {
                assert.dom(VALUE_INPUT).hasValue(value);
            }
        },
        {
            "The value is read-only": (assert) => async function () {
                assert.dom(VALUE_INPUT).hasAttribute('readonly');
            }
        },
        {
            "The issue status is not saved and the dialog stays open": (assert) => async function () {
                assert.dom('.modal [data-field="issuestatus.name"]').exists('the dialog is open');
                assert.strictEqual(createRequests().length, 0, 'no create request');
            }
        },
        {
            "The issue status $name is listed with the label $label": (assert) => async function (name, label) {
                let row = findRow(name);
                assert.ok(row, `${name} is listed`);
                assert.equal(row.querySelector('[data-column="label"]').textContent.trim(), label);
            }
        },
        {
            "One request created the issue status $name with the labels $labels": (assert) => async function (name, labels) {
                let requests = createRequests();
                assert.strictEqual(requests.length, 1, 'one create request');

                let attributes = JSON.parse(requests[0].requestBody).data.attributes;
                assert.strictEqual(attributes.name, name);
                assert.deepEqual(attributes.translations, JSON.parse(labels));
            }
        },
        {
            "The issue status $name was saved with the labels $labels": (assert) => async function (name, labels) {
                let status = server.schema.issuestatuses.findBy({ name });
                assert.deepEqual(status.translations, JSON.parse(labels));
            }
        },
        {
            "The update of the issue status $name sent no labels": (assert) => async function () {
                let requests = sentRequests('PATCH');
                assert.strictEqual(requests.length, 1, 'one update request');

                let attributes = JSON.parse(requests[0].requestBody).data.attributes;
                assert.notOk('translations' in attributes, 'no labels sent');
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
