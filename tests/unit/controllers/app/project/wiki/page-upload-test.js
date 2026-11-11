import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { createUploadTracker, FakeUploadStore, fakeFilesRelation } from '../../../../../helpers/upload-queue';

module('Unit | Controller | app/project/wiki/page upload queue', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:store', FakeUploadStore);
    });

    test('it never runs more than 3 uploads at once and finishes every file', async function (assert) {
        const controller = this.owner.lookup('controller:app.project.wiki.page');
        const files = fakeFilesRelation();
        controller.set('model', { get: (key) => (key === 'files' ? files : '1') });
        controller.set('session', { data: { authenticated: { access_token: 'token' } } });
        const tracker = createUploadTracker();
        const names = ['a', 'b', 'c', 'd', 'e'];

        names.forEach((name) => controller.uploadFile(tracker.createFile(name)));
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.strictEqual(tracker.inFlight, 3, 'three uploads started');
        assert.deepEqual(tracker.started, ['a', 'b', 'c'], 'the rest wait in the queue');

        while (tracker.pending.length) {
            await tracker.finishNext();
        }
        assert.ok(tracker.maxInFlight <= 3, 'never more than 3 in flight');
        assert.deepEqual(tracker.finished.slice().sort(), names, 'every file finished');
        assert.strictEqual(files.pushed.length, 5, 'every file was added to the wiki page');
    });
});
