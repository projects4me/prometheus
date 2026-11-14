import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | app/user/create', function (hooks) {
    setupTest(hooks);

    test('the success toast shows a user name containing markup as text', function (assert) {
        let controller = this.owner.lookup('controller:app/user/create');
        let intl = this.owner.lookup('service:intl');
        intl.addTranslations('en-us', { views: { app: { user: { created: 'User {name} created' } } } });
        let payload = '<img src=x onerror=alert(1)>';

        let message = controller.getSuccessMessage({ get: () => payload }).toString();

        assert.notOk(message.includes('<img'), 'no element is rendered');
        assert.ok(message.includes('&lt;img'), 'the name is escaped');
    });
});
