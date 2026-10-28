import { click, fillIn, settled, waitUntil } from '@ember/test-helpers';
import steps from '../steps';
import { translationsUrl } from 'prometheus/mirage/route-handlers/translation';

const TABLE = '[data-issue-types-table]';
const VALUE_INPUT = '.modal [data-field="issuetype.name"] input';

/**
 * Finds the table row of the default issue type with the given value.
 */
function findRow(name) {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-issue-type]`)]
        .find(row => row.querySelector('[data-column="value"]').textContent.trim() === name);
}

function splitNames(names) {
    return names.split(',').map(name => name.trim());
}

function labelInput(locale) {
    return `.modal [data-field="issuetype.label.${locale}"] input`;
}

/**
 * Messenger renders outside the testing root, so waitFor cannot see it.
 */
function waitForMessenger(selector) {
    return waitUntil(() => document.querySelector(selector));
}

/**
 * The create and update requests the page sent for issue types, per Mirage server.
 */
const sentWrites = new WeakMap();

/**
 * Starts recording the create and update requests of issue types; Mirage doesn't
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
        if (['POST', 'PATCH'].includes(verb) && /\/issuetype(\/[^/]+)?$/.test(path)) {
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
                        translations: row.label ? { 'en-us': row.label } : undefined,
                        system: '1',
                        projectId: null
                    });
                });
                assert.ok(true, `${table.length} default issue types exist`);
            }
        },
        {
            "Gaia offers the issue type locales $locales": (assert) => async function (locales) {
                server.get(translationsUrl(), () => splitNames(locales));
                assert.ok(true, `Gaia supports ${locales}`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User adds the issue type labelled $label with description $description": (assert) => async function (label, description) {
                recordWrites();
                await click('[data-btn="add-issue-type"]');
                await fillIn(labelInput('en-us'), label);
                await fillIn('.modal [data-field="issuetype.description"] input', description);
                await submitModal();
                assert.ok(true, `User adds the issue type ${label}`);
            }
        },
        {
            "User starts adding an issue type": (assert) => async function () {
                recordWrites();
                await click('[data-btn="add-issue-type"]');
                assert.ok(true, 'User starts adding an issue type');
            }
        },
        {
            "User starts editing the issue type $name": (assert) => async function (name) {
                recordWrites();
                await click(findRow(name).querySelector('[data-btn="edit-issue-type"]'));
                assert.ok(true, `User starts editing the issue type ${name}`);
            }
        },
        {
            "User types the issue type $locale label $label": (assert) => async function (locale, label) {
                await fillIn(labelInput(locale), label);
                assert.ok(true, `User types the ${locale} label ${label}`);
            }
        },
        {
            "User types the issue type value $value": (assert) => async function (value) {
                await fillIn(VALUE_INPUT, value);
                assert.ok(true, `User types the value ${value}`);
            }
        },
        {
            "User types the issue type description $description": (assert) => async function (description) {
                await fillIn('.modal [data-field="issuetype.description"] input', description);
                assert.ok(true, `User types the description ${description}`);
            }
        },
        {
            "User saves the issue type": (assert) => async function () {
                await submitModal();
                assert.ok(true, 'User saves the issue type');
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
                    document.querySelectorAll(`${TABLE} tbody tr[data-issue-type]`).length,
                    parseInt(count)
                );
            }
        },
        {
            "The issue types table has the columns $headings": (assert) => async function (headings) {
                let columns = [...document.querySelectorAll(`${TABLE} thead th`)]
                    .map(heading => heading.textContent.trim())
                    .filter(Boolean);
                assert.deepEqual(columns, splitNames(headings), 'column headings');
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
            "The issue type $name is listed with the label $label": (assert) => async function (name, label) {
                let row = findRow(name);
                assert.ok(row, `${name} is listed`);
                assert.equal(row.querySelector('[data-column="label"]').textContent.trim(), label);
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
            "The issue type dialog has a label field for $locales": (assert) => async function (locales) {
                let fields = [...document.querySelectorAll('.modal [data-field^="issuetype.label."]')]
                    .map(field => field.dataset.field.replace('issuetype.label.', ''));
                assert.deepEqual(fields, splitNames(locales), 'label fields');
            }
        },
        {
            "The issue type value reads $value": (assert) => async function (value) {
                assert.dom(VALUE_INPUT).hasValue(value);
            }
        },
        {
            "The issue type value is read-only": (assert) => async function () {
                assert.dom(VALUE_INPUT).hasAttribute('readonly');
            }
        },
        {
            "The issue type is not saved and the dialog stays open": (assert) => async function () {
                assert.dom('.modal [data-field="issuetype.name"]').exists('the dialog is open');
                assert.strictEqual(sentRequests('POST').length, 0, 'no create request');
            }
        },
        {
            "One request created the issue type $name with the labels $labels": (assert) => async function (name, labels) {
                let requests = sentRequests('POST');
                assert.strictEqual(requests.length, 1, 'one create request');

                let attributes = JSON.parse(requests[0].requestBody).data.attributes;
                assert.strictEqual(attributes.name, name);
                assert.deepEqual(attributes.translations, JSON.parse(labels));
            }
        },
        {
            "The issue type $name was saved with the labels $labels": (assert) => async function (name, labels) {
                let type = server.schema.issuetypes.findBy({ name });
                assert.deepEqual(type.translations, JSON.parse(labels));
            }
        },
        {
            "The update of the issue type $name sent no labels": (assert) => async function () {
                let requests = sentRequests('PATCH');
                assert.strictEqual(requests.length, 1, 'one update request');

                let attributes = JSON.parse(requests[0].requestBody).data.attributes;
                assert.notOk('translations' in attributes, 'no labels sent');
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
