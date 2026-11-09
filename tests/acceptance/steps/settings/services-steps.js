import { click, fillIn, settled, waitUntil } from '@ember/test-helpers';
import steps from '../steps';

const TABLE = '[data-services-table]';

function findRow(name) {
    return [...document.querySelectorAll(`${TABLE} tbody tr[data-service-client]`)]
        .find(row => row.querySelector('[data-column="name"]').textContent.trim() === name);
}

function cell(row, column) {
    return row.querySelector(`[data-column="${column}"]`).textContent.trim();
}

function findByAttr(attr, name) {
    return [...document.querySelectorAll(`[${attr}]`)]
        .find(row => row.querySelector('[data-column="name"]').textContent.trim() === name);
}

function inMinutes(minutes) {
    return new Date(Date.now() + Number(minutes) * 60 * 1000).toISOString();
}

export const given = function () {
    return [
        {
            "The enrollment requests are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('serviceenrollment', {
                        name: row.name,
                        kind: row.kind,
                        userCode: row.userCode,
                        expiresAt: inMinutes(row.minutesLeft)
                    });
                });
                assert.ok(true, `${table.length} enrollment requests exist`);
            }
        },
        {
            "The enrollment tokens are\n$table": (assert) => async function (table) {
                table.forEach(row => {
                    server.create('serviceenrollmenttoken', {
                        name: row.name,
                        kind: row.kind,
                        usedAt: row.used === 'yes' ? inMinutes(-1) : null,
                        expiresAt: inMinutes(row.minutesLeft)
                    });
                });
                assert.ok(true, `${table.length} enrollment tokens exist`);
            }
        },
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
            "User approves the request $name and cancels": (assert) => async function (name) {
                await click(findByAttr('data-request', name).querySelector('[data-btn="approve-request"]'));
                assert.ok(document.querySelector('.modal [data-request-confirm] [data-request-code]'), 'confirmation shows the code');
                await click('.modal .btn-default');
                await settled();
            }
        },
        {
            "User approves the request $name and confirms": (assert) => async function (name) {
                await click(findByAttr('data-request', name).querySelector('[data-btn="approve-request"]'));
                await click('.modal .btn-primary');
                await settled();
            }
        },
        {
            "User denies the request $name and confirms": (assert) => async function (name) {
                await click(findByAttr('data-request', name).querySelector('[data-btn="deny-request"]'));
                assert.ok(document.querySelector('.modal [data-request-confirm]'), 'confirmation is open');
                await click('.modal .btn-primary');
                await settled();
            }
        },
        {
            "User creates the enrollment token $name": (assert) => async function (name) {
                await fillIn('[data-token-form] input', name);
                await click('[data-btn="create-token"]');
                await settled();
            }
        },
        {
            "User closes the created token": (assert) => async function () {
                await click('.modal [data-btn="cancel"]');
                await waitUntil(() => !document.querySelector('[data-token-created]'), { timeout: 3000 });
                await settled();
            }
        },
        {
            "User revokes the enrollment token $name": (assert) => async function (name) {
                await click(findByAttr('data-token', name).querySelector('[data-btn="revoke-token"]'));
                await settled();
            }
        },
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
            "The enrollment request $name is listed with code $code": (assert) => async function (name, code) {
                let row = findByAttr('data-request', name);
                assert.ok(row, `${name} is listed`);
                assert.equal(cell(row, 'userCode'), code, 'user code');
            }
        },
        {
            "The enrollment request $name is no longer listed": (assert) => async function (name) {
                assert.notOk(findByAttr('data-request', name), `${name} is not listed`);
            }
        },
        {
            "The enrollment request $name is stored as $status": (assert) => async function (name, status) {
                assert.equal(server.schema.serviceenrollments.findBy({ name }).status, status, 'stored status');
            }
        },
        {
            "The enrollment request $name is listed as expired without approve or deny": (assert) => async function (name) {
                let row = findByAttr('data-request', name);
                assert.ok(row, `${name} is listed`);
                assert.equal(cell(row, 'timeLeft'), 'Expired', 'time left');
                assert.notOk(row.querySelector('[data-btn="approve-request"]'), 'no approve');
                assert.notOk(row.querySelector('[data-btn="deny-request"]'), 'no deny');
            }
        },
        {
            "The created token is shown with the single-use warning": (assert) => async function () {
                assert.ok(document.querySelector('.modal [data-token-value]').value, 'token is shown');
                assert.ok(document.querySelector('.modal [data-token-warning]').textContent.includes('single time'), 'warning');
                assert.ok(document.querySelector('.modal [data-btn="copy-token"]'), 'copy button');
            }
        },
        {
            "The created token is not shown": (assert) => async function () {
                assert.notOk(document.querySelector('[data-token-created]'), 'token is hidden');
            }
        },
        {
            "The enrollment token $name is listed as $kind, $state": (assert) => async function (name, kind, state) {
                let row = findByAttr('data-token', name);
                assert.ok(row, `${name} is listed`);
                assert.equal(cell(row, 'kind'), kind, 'kind');
                assert.equal(cell(row, 'state'), state, 'state');
            }
        },
        {
            "The enrollment token $name is no longer listed": (assert) => async function (name) {
                assert.notOk(findByAttr('data-token', name), `${name} is not listed`);
            }
        },
        {
            "The enrollment token $name is no longer stored": (assert) => async function (name) {
                assert.notOk(server.schema.serviceenrollmenttokens.findBy({ name }), 'token is deleted');
            }
        },
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
