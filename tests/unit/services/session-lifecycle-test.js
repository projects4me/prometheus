import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { authenticateSession } from 'prometheus/tests/helpers/session';

module('Unit | Service | session lifecycle', function (hooks) {
    setupTest(hooks);

    let transitions;

    hooks.beforeEach(function () {
        transitions = [];
        let router = this.owner.lookup('service:router');
        // Unit tests do not boot a full router; capture the destination only.
        router.transitionTo = (route) => transitions.push(route);
    });

    test('authenticate persists the ember-simple-auth shape', async function (assert) {
        let session = this.owner.lookup('service:session');
        await authenticateSession({ access_token: 'a', refresh_token: 'r', expires_at: 1 });

        let persisted = await session.store.restore();

        assert.true(session.isAuthenticated);
        assert.deepEqual(persisted, {
            authenticated: { authenticator: 'authenticator:test', access_token: 'a', refresh_token: 'r', expires_at: 1 },
        });
    });

    test('a failed authenticate rejects with the authenticator error and stays signed out', async function (assert) {
        let session = this.owner.lookup('service:session');
        this.owner.register(
            'authenticator:failing',
            class extends EmberObject {
                authenticate() {
                    return Promise.reject({ error: 'invalid_grant' });
                }
            }
        );

        try {
            await session.authenticate('authenticator:failing');
            assert.ok(false, 'should reject');
        } catch (e) {
            assert.strictEqual(e.error, 'invalid_grant', 'the error reaches the caller');
        }

        assert.false(session.isAuthenticated);
    });

    test('invalidate clears the session and the store', async function (assert) {
        let session = this.owner.lookup('service:session');
        await authenticateSession({ access_token: 'a' });

        await session.invalidate();

        assert.false(session.isAuthenticated);
        assert.deepEqual(await session.store.restore(), { authenticated: {} });
    });

    test('requireAuthentication keeps the transition and handleAuthentication retries it', async function (assert) {
        let session = this.owner.lookup('service:session');
        let retried = 0;
        let transition = { retry: () => retried++ };

        assert.false(session.requireAuthentication(transition, 'signin'));
        assert.deepEqual(transitions, ['signin'], 'signed out user is sent to signin');

        await authenticateSession({ access_token: 'a' });
        session.handleAuthentication('app');

        assert.strictEqual(retried, 1, 'the intercepted transition is retried');
        assert.strictEqual(session.attemptedTransition, null);
        assert.deepEqual(transitions, ['signin'], 'no other navigation');
    });

    test('prohibitAuthentication sends a signed in user away', async function (assert) {
        let session = this.owner.lookup('service:session');

        assert.true(session.prohibitAuthentication('app'), 'signed out: allowed');
        await authenticateSession({ access_token: 'a' });
        assert.false(session.prohibitAuthentication('app'), 'signed in: prohibited');
        assert.deepEqual(transitions, ['app']);
    });

    test('setup routes the user after sign-in through handleAuthentication', async function (assert) {
        let session = this.owner.lookup('service:session');
        let handled = [];
        session.handleAuthentication = (route) => handled.push(route);

        await session.setup();
        await authenticateSession({ access_token: 'a' });

        assert.deepEqual(handled, ['app'], 'the configured routeAfterAuthentication');
    });

    test('a sign-in in another tab authenticates this tab', async function (assert) {
        let session = this.owner.lookup('service:session');
        let handled = 0;
        session.handleAuthentication = () => handled++;
        await session.setup();

        session._onStoreDataUpdated({
            authenticated: { authenticator: 'authenticator:oauth2', access_token: 'other-tab' },
        });
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.true(session.isAuthenticated);
        assert.strictEqual(session.data.authenticated.access_token, 'other-tab');
        assert.strictEqual(handled, 1, 'post-auth navigation runs');
    });

    test('a sign-out in another tab invalidates this tab', async function (assert) {
        let session = this.owner.lookup('service:session');
        let invalidated = [];
        session.handleInvalidation = (url) => invalidated.push(url);
        await session.setup();
        await authenticateSession({ access_token: 'a' });

        session._onStoreDataUpdated({ authenticated: {} });
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.false(session.isAuthenticated);
        assert.strictEqual(invalidated.length, 1, 'the app reloads');
    });
});
