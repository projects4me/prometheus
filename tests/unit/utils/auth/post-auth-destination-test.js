import { module, test } from 'qunit';
import {
    DEFAULT_POST_AUTH_ROUTE,
    isBlockedPostAuthUrl,
    resolvePostAuthDestination,
} from 'prometheus/utils/auth/post-auth-destination';

module('Unit | Utility | auth/post-auth-destination', function () {
    test('isBlockedPostAuthUrl blocks sign-in and root entry routes', function (assert) {
        assert.ok(isBlockedPostAuthUrl('/'));
        assert.ok(isBlockedPostAuthUrl('/signin'));
        assert.ok(isBlockedPostAuthUrl('/sign'));
        assert.notOk(isBlockedPostAuthUrl('/app/project/acme'));
    });

    test('resolvePostAuthDestination uses default app route when no deep link', function (assert) {
        assert.strictEqual(
            resolvePostAuthDestination({ fallbackRoute: 'index' }),
            DEFAULT_POST_AUTH_ROUTE
        );
        assert.strictEqual(
            resolvePostAuthDestination({ fallbackRoute: 'app' }),
            'app'
        );
    });

    test('resolvePostAuthDestination preserves a valid pre-auth deep link', function (assert) {
        assert.strictEqual(
            resolvePostAuthDestination({
                fallbackRoute: 'app',
                oldRequestedUrl: '/app/project/acme/issue/1',
            }),
            '/app/project/acme/issue/1'
        );
    });

    test('resolvePostAuthDestination ignores sign-in URLs stored as oldRequestedUrl', function (assert) {
        assert.strictEqual(
            resolvePostAuthDestination({
                fallbackRoute: 'app',
                oldRequestedUrl: '/signin',
            }),
            'app'
        );
    });
});
