import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Authenticator | oauth2', function (hooks) {
    setupTest(hooks);

    function stubRequests(authenticator) {
        let requests = [];
        authenticator.makeRequest = function (url, data) {
            requests.push({ url, data });
            return Promise.reject({ responseJSON: { error: 'unexpected' } });
        };
        return requests;
    }

    test('restore schedules no authenticator refresh', async function (assert) {
        let authenticator = this.owner.lookup('authenticator:oauth2');
        let scheduled = 0;
        authenticator._scheduleAccessTokenRefresh = () => { scheduled += 1; };
        let data = { access_token: 'a', refresh_token: 'r', expires_at: Date.now() + 3600 * 1000 };

        let restored = await authenticator.restore(data);

        assert.strictEqual(restored, data, 'session data is restored as is');
        assert.strictEqual(scheduled, 0, 'no refresh timer is scheduled');
        assert.false(authenticator.get('refreshAccessTokens'), 'authenticator refresh is disabled');
    });

    test('restore with an expired token resolves without POSTing to /token', async function (assert) {
        let authenticator = this.owner.lookup('authenticator:oauth2');
        let requests = stubRequests(authenticator);
        let data = { access_token: 'a', refresh_token: 'r', expires_at: Date.now() - 1000 };

        let restored = await authenticator.restore(data);

        assert.strictEqual(restored, data, 'expired session is resolved so session.ensureFreshToken refreshes it');
        assert.strictEqual(requests.length, 0, 'the authenticator makes no token request');
    });

    test('restore rejects data without an access token', async function (assert) {
        let authenticator = this.owner.lookup('authenticator:oauth2');

        try {
            await authenticator.restore({ refresh_token: 'r' });
            assert.ok(false, 'should reject');
        } catch (e) {
            assert.ok(true, 'rejected');
        }
    });
});
