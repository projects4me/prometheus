import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ARGS_SET } from '@glimmer/component/-private/component';
import IssueDetails from 'prometheus/components/issue/issue-details';
import { createUploadTracker, FakeUploadStore, fakeFilesRelation } from '../../../helpers/upload-queue';

module('Unit | Component | issue/issue-details upload queue', function (hooks) {
    setupTest(hooks);

    let toasts;
    let originalMessenger;

    hooks.beforeEach(function () {
        toasts = [];
        originalMessenger = window.Messenger;
        window.Messenger = function () {
            return { post: (options) => toasts.push(options) };
        };
        this.owner.register('service:store', FakeUploadStore);
    });

    hooks.afterEach(function () {
        window.Messenger = originalMessenger;
    });

    function build(owner) {
        const files = fakeFilesRelation();
        const issue = { id: '1', get: () => files };
        // A unit test has no renderer to hand the component its args: register them the way the manager does
        const args = { issue };
        ARGS_SET.set(args, true);
        const component = new IssueDetails(owner, args);
        return { component, files };
    }

    test('it never runs more than 3 uploads at once and finishes every file', async function (assert) {
        const tracker = createUploadTracker();
        const { component, files } = build(this.owner);
        const names = ['a', 'b', 'c', 'd', 'e'];
        names.forEach((name) => component.uploadFile(tracker.createFile(name)));
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.strictEqual(tracker.inFlight, 3, 'three uploads started');
        assert.deepEqual(tracker.started, ['a', 'b', 'c'], 'the rest wait in the queue');

        await tracker.finishNext();
        assert.strictEqual(tracker.inFlight, 3, 'the next queued upload started');
        assert.deepEqual(tracker.started, ['a', 'b', 'c', 'd']);

        while (tracker.pending.length) {
            await tracker.finishNext();
        }
        assert.ok(tracker.maxInFlight <= 3, 'never more than 3 in flight');
        assert.deepEqual(tracker.finished.slice().sort(), names, 'every file finished');
        assert.strictEqual(files.length, 5, 'every file was added to the issue');
    });

    test('it rejects a file over the size limit without uploading it', async function (assert) {
        const tracker = createUploadTracker();
        const { component, files } = build(this.owner);
        const tooBig = tracker.createFile('big', component.config.app.upload.maxFileSize + 1);
        component.uploadFile(tooBig);
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.deepEqual(tracker.started, [], 'no upload request was started');
        assert.strictEqual(files.length, 0, 'nothing was added to the issue');
        assert.strictEqual(toasts.length, 1, 'the user was told');
        assert.strictEqual(toasts[0].type, 'error');
    });
});
