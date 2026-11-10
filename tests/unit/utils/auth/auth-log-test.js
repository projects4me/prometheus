import { module, test } from 'qunit';
import {
    AUTH_LOG_KEY,
    AUTH_LOG_MAX,
    logAuthEvent,
    readAuthLog,
    clearAuthLog,
    redact,
} from 'prometheus/utils/auth/auth-log';

module('Unit | Utility | auth/auth-log', function (hooks) {
    hooks.beforeEach(function () {
        clearAuthLog();
    });
    hooks.afterEach(function () {
        clearAuthLog();
    });

    test('keeps only the last AUTH_LOG_MAX entries', function (assert) {
        for (let i = 0; i < AUTH_LOG_MAX + 5; i++) {
            logAuthEvent('e', { i });
        }
        const log = readAuthLog();

        assert.strictEqual(log.length, AUTH_LOG_MAX);
        assert.strictEqual(log[0].detail.i, 5);
    });

    test('persists entries in localStorage with time, tab and event', function (assert) {
        logAuthEvent('refresh started', { force: true });
        const stored = JSON.parse(localStorage.getItem(AUTH_LOG_KEY));

        assert.strictEqual(stored.length, 1);
        assert.strictEqual(stored[0].event, 'refresh started');
        assert.ok(stored[0].time);
        assert.ok(stored[0].tab);
        assert.true(stored[0].detail.force);
    });

    test('never stores tokens, passwords or secrets', function (assert) {
        logAuthEvent('x', {
            access_token: 'abc',
            refresh_token: 'def',
            password: 'p',
            client_secret: 's',
            status: 401,
        });

        assert.deepEqual(readAuthLog()[0].detail, { status: 401 });
        assert.deepEqual(redact({ refresh_token: 'x' }), {});
    });

    test('survives corrupt storage', function (assert) {
        localStorage.setItem(AUTH_LOG_KEY, '{bad');
        assert.deepEqual(readAuthLog(), []);
        logAuthEvent('ok');
        assert.strictEqual(readAuthLog().length, 1);
    });
});
