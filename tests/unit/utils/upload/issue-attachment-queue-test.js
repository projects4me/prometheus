import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { destroy } from '@ember/destroyable';
import IssueAttachmentQueue from 'prometheus/utils/upload/issue-attachment-queue';
import { createUploadTracker, FakeUploadStore, fakeFilesRelation } from '../../../helpers/upload-queue';

const MAX_FILE_SIZE = 1000;

module('Unit | Utility | upload/issue-attachment-queue', function (hooks) {
    setupTest(hooks);

    let errors;
    let queues;

    hooks.beforeEach(function () {
        errors = [];
        queues = [];
        this.owner.register('service:store', FakeUploadStore);
    });

    hooks.afterEach(function () {
        queues.forEach((queue) => destroy(queue));
    });

    function build(owner) {
        const files = fakeFilesRelation();
        const issue = { id: '1', get: () => files };
        const queue = new IssueAttachmentQueue({
            store: owner.lookup('service:store'),
            intl: { t: (key) => key },
            maxFileSize: MAX_FILE_SIZE,
            issue: () => issue,
            notifyError: (message) => errors.push(message)
        });
        queues.push(queue);
        return { queue, files };
    }

    test('it never runs more than 3 uploads at once and finishes every file', async function (assert) {
        const tracker = createUploadTracker();
        const { queue, files } = build(this.owner);
        const names = ['a', 'b', 'c', 'd', 'e'];
        names.forEach((name) => queue.add(tracker.createFile(name)));
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
        assert.deepEqual(errors, [], 'no error was reported');
    });

    test('it rejects a file over the size limit without uploading it', async function (assert) {
        const tracker = createUploadTracker();
        const { queue, files } = build(this.owner);
        queue.add(tracker.createFile('big', MAX_FILE_SIZE + 1));
        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.deepEqual(tracker.started, [], 'no upload request was started');
        assert.strictEqual(files.length, 0, 'nothing was added to the issue');
        assert.deepEqual(errors, ['views.app.issue.detail.file.uploadFailedSize'], 'the user was told');
        assert.deepEqual(tracker.removed, ['big'], 'the file left the ember-file-upload queue');
    });

    test('a failed upload is reported, leaves the queue and leaves no upload record', async function (assert) {
        const tracker = createUploadTracker();
        tracker.failUploads = true;
        const { queue, files } = build(this.owner);
        queue.add(tracker.createFile('bad'));
        await new Promise((resolve) => setTimeout(resolve, 0));

        const store = this.owner.lookup('service:store');
        assert.deepEqual(errors, ['views.app.issue.detail.file.uploadfailed'], 'the user was told');
        assert.deepEqual(tracker.removed, ['bad'], 'the file left the ember-file-upload queue');
        assert.strictEqual(files.length, 0, 'nothing was added to the issue');
        assert.true(store.records.every((r) => r.rolledBack), 'the new upload record was rolled back');
    });
});
