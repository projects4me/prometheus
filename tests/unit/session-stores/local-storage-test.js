import { module, test } from 'qunit';
import LocalStorageStore, { SESSION_STORAGE_KEY } from 'prometheus/session-stores/local-storage';

module('Unit | Session store | local-storage', function (hooks) {
    let store;

    hooks.beforeEach(function () {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        store = new LocalStorageStore();
    });

    hooks.afterEach(function () {
        store.destroy();
        localStorage.removeItem(SESSION_STORAGE_KEY);
    });

    test('keeps the ember-simple-auth key, so existing sessions survive the switch', async function (assert) {
        assert.strictEqual(SESSION_STORAGE_KEY, 'ember_simple_auth-session');

        localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({ authenticated: { authenticator: 'authenticator:oauth2', access_token: 'a' } })
        );

        let data = await store.restore();
        assert.strictEqual(data.authenticated.access_token, 'a', 'a session written before the switch is read');
    });

    test('persist writes JSON that restore reads back', async function (assert) {
        await store.persist({ authenticated: { authenticator: 'authenticator:oauth2', access_token: 'b' } });

        assert.deepEqual(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)), {
            authenticated: { authenticator: 'authenticator:oauth2', access_token: 'b' },
        });
        assert.strictEqual((await store.restore()).authenticated.access_token, 'b');
    });

    test('restore resolves an empty object for missing or unreadable data', async function (assert) {
        assert.deepEqual(await store.restore(), {}, 'nothing stored');

        localStorage.setItem(SESSION_STORAGE_KEY, '{not json');
        assert.deepEqual(await store.restore(), {}, 'unreadable data');
    });

    test('clear removes the key', async function (assert) {
        await store.persist({ authenticated: { access_token: 'c' } });
        await store.clear();

        assert.strictEqual(localStorage.getItem(SESSION_STORAGE_KEY), null);
    });

    test('a storage event from another tab reports the new data once', async function (assert) {
        let updates = [];
        store.onDataUpdated = (data) => updates.push(data);

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ authenticated: { access_token: 'other-tab' } }));
        window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STORAGE_KEY }));
        window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STORAGE_KEY }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'some-other-key' }));

        assert.strictEqual(updates.length, 1, 'unchanged data and other keys are ignored');
        assert.strictEqual(updates[0].authenticated.access_token, 'other-tab');
    });

    test('a storage event for data this tab wrote is ignored', async function (assert) {
        let updates = 0;
        store.onDataUpdated = () => updates++;

        await store.persist({ authenticated: { access_token: 'mine' } });
        window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STORAGE_KEY }));

        assert.strictEqual(updates, 0);
    });
});
