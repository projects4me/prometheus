/**
 * Test helpers for the handleUpload ember-concurrency tasks (issue attachment queue, wiki attachments).
 * A fake file's upload() stays pending until the test finishes it, so the test can see how many
 * uploads are in flight at once.
 */
import Service from '@ember/service';

export function createUploadTracker() {
    const tracker = {
        inFlight: 0,
        maxInFlight: 0,
        started: [],
        finished: [],
        pending: [],
        removed: [],
        records: [],
    };

    tracker.createFile = function (name, size = 100) {
        return {
            name,
            size,
            queue: {
                remove(file) {
                    tracker.removed.push(file.name);
                },
            },
            upload() {
                if (tracker.failUploads) {
                    return Promise.reject(new Error('server error'));
                }
                tracker.inFlight++;
                tracker.maxInFlight = Math.max(tracker.maxInFlight, tracker.inFlight);
                tracker.started.push(name);
                return new Promise((resolve) => {
                    tracker.pending.push(() => {
                        tracker.inFlight--;
                        tracker.finished.push(name);
                        const payload = {
                            data: {
                                id: `id-${name}`,
                                attributes: {
                                    name,
                                    fileSize: String(size),
                                    fileType: 'text/plain',
                                    fileMime: 'text/plain',
                                    fileThumbnail: null,
                                    relatedTo: 'issue',
                                    relatedId: '1',
                                },
                            },
                        };
                        resolve({ json: async () => payload, body: JSON.stringify(payload) });
                    });
                });
            },
        };
    };

    // Finishes the oldest in-flight upload and lets the queue start the next one.
    tracker.finishNext = async function () {
        const finish = tracker.pending.shift();
        finish();
        await new Promise((resolve) => setTimeout(resolve, 0));
    };

    return tracker;
}

export class FakeUploadStore extends Service {
    records = [];

    createRecord() {
        const record = {
            store: this,
            setProperties(props) {
                Object.assign(this, props);
            },
            rollbackAttributes() {
                this.rolledBack = true;
            },
        };
        this.records.push(record);
        return record;
    }

    adapterFor() {
        return { buildURL: () => '/upload', headers: {} };
    }
}

export function fakeFilesRelation() {
    return [];
}
