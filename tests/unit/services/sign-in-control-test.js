import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Service | sign-in-control', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.owner.unregister('service:router');
        this.owner.register(
            'service:router',
            class extends Service {
                currentRouteName = 'index';
                on() {}
            }
        );

        this.owner.unregister('service:session');
        this.owner.register(
            'service:session',
            class extends Service {
                isAuthenticated = false;
            }
        );
    });

    test('canSubmitSignIn is true on signin when unauthenticated and idle', function (assert) {
        let router = this.owner.lookup('service:router');
        router.currentRouteName = 'signin';

        let session = this.owner.lookup('service:session');
        session.isAuthenticated = false;

        let signInControl = this.owner.lookup('service:sign-in-control');
        signInControl.isAuthenticating = false;
        signInControl.isNavigatingToApp = false;

        assert.true(signInControl.canSubmitSignIn);
    });

    test('canSubmitSignIn is false while navigating to the app shell', function (assert) {
        let router = this.owner.lookup('service:router');
        router.currentRouteName = 'signin';

        let session = this.owner.lookup('service:session');
        session.isAuthenticated = false;

        let signInControl = this.owner.lookup('service:sign-in-control');
        signInControl.isNavigatingToApp = true;

        assert.false(signInControl.canSubmitSignIn);
    });

    test('canSubmitSignIn is false on app routes', function (assert) {
        let router = this.owner.lookup('service:router');
        router.currentRouteName = 'app.index';

        let session = this.owner.lookup('service:session');
        session.isAuthenticated = false;

        let signInControl = this.owner.lookup('service:sign-in-control');

        assert.false(signInControl.canSubmitSignIn);
    });

    test('isHeaderSignInEnabled is false on the app shell', function (assert) {
        let signInControl = this.owner.lookup('service:sign-in-control');

        assert.false(signInControl.isHeaderSignInEnabled);
    });
});
