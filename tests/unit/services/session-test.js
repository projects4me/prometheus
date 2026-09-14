import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { REFRESH_WINDOW_MS } from 'prometheus/services/session';

module('Unit | Service | session', function (hooks) {
    setupTest(hooks);

    function nearExpirySession(overrides = {}) {
        return {
            authenticator: 'authenticator:oauth2',
            access_token: 'access-old',
            refresh_token: 'refresh-old',
            expires_at: Date.now() + 30 * 1000,
            ...overrides,
        };
    }

    test('ensureFreshToken single-flight: concurrent callers share one refresh POST', async function (assert) {
        assert.expect(4);

        await authenticateSession(nearExpirySession());

        let session = this.owner.lookup('service:session');
        let refreshCalls = 0;
        let originalFetch = window.fetch;

        window.fetch = function (url, options) {
            if (String(url).includes('/token')) {
                refreshCalls += 1;
                assert.strictEqual(
                    options.headers['Content-Type'],
                    'application/x-www-form-urlencoded',
                    'refresh uses form-urlencoded'
                );
                assert.ok(
                    options.body.includes('grant_type=refresh_token'),
                    'refresh body is urlencoded'
                );

                return Promise.resolve({
                    ok: true,
                    json() {
                        return Promise.resolve({
                            access_token: 'access-new',
                            refresh_token: 'refresh-new',
                            expires_in: 3600,
                            scope: 'user',
                            token_type: 'Bearer',
                        });
                    },
                });
            }

            return originalFetch.apply(this, arguments);
        };

        try {
            await Promise.all([
                session.ensureFreshToken(),
                session.ensureFreshToken(),
                session.ensureFreshToken(),
            ]);

            assert.strictEqual(refreshCalls, 1, 'exactly one token refresh POST');
            assert.strictEqual(
                session.get('data.authenticated.access_token'),
                'access-new',
                'session receives updated access token'
            );
        } finally {
            window.fetch = originalFetch;
        }
    });

    test('ensureFreshToken skips refresh when persisted session is already fresh', async function (assert) {
        assert.expect(2);

        await authenticateSession(
            nearExpirySession({
                access_token: 'access-stale',
                expires_at: Date.now() + 10 * 1000,
            })
        );

        let session = this.owner.lookup('service:session');
        let store = session.get('store');
        let freshExpiresAt = Date.now() + REFRESH_WINDOW_MS + 120 * 1000;

        await store.persist({
            authenticated: {
                authenticator: 'authenticator:oauth2',
                access_token: 'access-from-other-tab',
                refresh_token: 'refresh-from-other-tab',
                expires_at: freshExpiresAt,
            },
        });

        let refreshCalls = 0;
        let originalFetch = window.fetch;

        window.fetch = function (url) {
            if (String(url).includes('/token')) {
                refreshCalls += 1;
            }

            return originalFetch.apply(this, arguments);
        };

        try {
            await session.ensureFreshToken();

            assert.strictEqual(refreshCalls, 0, 'no refresh when store already has fresh tokens');
            assert.strictEqual(
                session.get('data.authenticated.access_token'),
                'access-from-other-tab',
                'in-memory session reconciled from store'
            );
        } finally {
            window.fetch = originalFetch;
        }
    });
});
