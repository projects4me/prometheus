import { click, settled } from '@ember/test-helpers';
import steps from '../steps';

const TABLE = '[data-services-table]';

function findRow(name) {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-service-client]`)]
        .find(row => row.querySelector('[data-column="name"]').textContent.trim() === name);
}

function cell(row, column) {
    return row.querySelector(`[data-column="${column}"]`).textContent.trim();
}

export const given = function () {
    return [
        {
            "The service clients are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('serviceclient', {
                        name: row.name,
                        kind: row.kind,
                        status: row.status,
                        lastUsedAt: row.lastUsedAt && row.lastUsedAt !== '-' ? row.lastUsedAt : null
                    });
                });
                assert.ok(true, `${table.length} service clients exist`);
            }
        }
    ];
};

export const when = function () {
    return [
        {
            "User disables the service $name and cancels": (assert) => async function (name) {
                await click(findRow(name).querySelector('[data-btn="disable-service"]'));
                assert.ok(document.querySelector('.modal [data-services-confirm]'), 'confirmation is open');
                await click('.modal .btn-default');
                await settled();
            }
        },
        {
            "User disables the service $name and confirms": (assert) => async function (name) {
                await click(findRow(name).querySelector('[data-btn="disable-service"]'));
                assert.ok(document.querySelector('.modal [data-services-confirm]'), 'confirmation is open');
                await click('.modal .btn-primary');
                await settled();
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The services are listed in the order $names": (assert) => async function (names) {
                let listed = [...document.querySelectorAll(`${TABLE} tbody tr[data-service-client] [data-column="name"]`)]
                    .map(c => c.textContent.trim());
                assert.deepEqual(listed, names.split(',').map(n => n.trim()), 'listed order');
            }
        },
        {
            "The service $name is listed as $kind, $status, last used $lastUsed": (assert) => async function (name, kind, status, lastUsed) {
                let row = findRow(name);
                assert.ok(row, `${name} is listed`);
                assert.equal(cell(row, 'kind'), kind, 'kind');
                assert.equal(cell(row, 'status'), status, 'status');
                assert.equal(cell(row, 'lastUsed'), lastUsed, 'last used');
            }
        },
        {
            "The services page shows the empty state": (assert) => async function () {
                assert.ok(document.querySelector('[data-services-empty]'), 'empty state');
            }
        },
        {
            "The service client $name is stored as $status": (assert) => async function (name, status) {
                let stored = server.schema.serviceclients.findBy({ name });
                assert.equal(stored.status, status, 'stored status');
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
