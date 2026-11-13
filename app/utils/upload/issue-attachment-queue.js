/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { task } from 'ember-concurrency';
import { pushRecords } from 'prometheus/utils/array/record-list';

/**
 * The upload queue for an issue's attachments: at most 3 uploads run at once and the rest wait their turn.
 * A file over the size limit is rejected without uploading it. Each uploaded file becomes an `upload` record
 * added to the issue's files; a failed upload is rolled back. Every rejection or failure is passed to `notifyError`.
 *
 * ```javascript
 * this.attachmentQueue = new IssueAttachmentQueue({
 *     store: this.store,
 *     intl: this.intl,
 *     maxFileSize: this.config.app.upload.maxFileSize,
 *     issue: () => this.issue,
 *     notifyError: (message) => this.showUploadError(message)
 * });
 * associateDestroyableChild(this, this.attachmentQueue);
 * this.attachmentQueue.add(file);
 * ```
 *
 * @class IssueAttachmentQueue
 * @namespace Prometheus.Utils.Upload
 */
export default class IssueAttachmentQueue {
    /**
     * @method constructor
     * @param {Object} options
     * @param {Store} options.store the ember-data store, which creates the upload records and knows the upload URL
     * @param {Service} options.intl the intl service, for the error messages
     * @param {Number} options.maxFileSize the largest file accepted, in bytes
     * @param {Function} options.issue returns the issue the files are attached to
     * @param {Function} options.notifyError tells the user about a rejected or failed upload, given the message
     */
    constructor({ store, intl, maxFileSize, issue, notifyError }) {
        this.store = store;
        this.intl = intl;
        this.maxFileSize = maxFileSize;
        this.issue = issue;
        this.notifyError = notifyError;
    }

    /**
     * Queues a file for upload.
     *
     * @method add
     * @param {Object} file an ember-file-upload UploadFile
     * @return {TaskInstance}
     */
    add(file) {
        return this.uploadTask.perform(file);
    }

    /**
     * Uploads one file, at most 3 at once, in the order they were added
     *
     * @property uploadTask
     * @type Task
     * @private
     */
    uploadTask = task({ maxConcurrency: 3, enqueue: true }, async (file) => {
        Logger.debug('Trying to upload a file');

        if (file.size > this.maxFileSize) {
            this.notifyError(this.intl.t("views.app.issue.detail.file.uploadFailedSize", { size: this.maxFileSize / 1024 / 1024 }));
            return;
        }

        let issue = this.issue();
        let upload = this.store.createRecord('upload', {});

        try {
            let adapter = upload.store.adapterFor('upload');
            let response = await file.upload({
                url: adapter.buildURL('upload'),
                data: {
                    relatedTo: 'issue',
                    relatedId: issue.id
                },
                headers: adapter.headers
            });
            let data = await response.json();

            upload.setProperties({
                id: data.data.id,
                name: data.data.attributes.name,
                fileSize: data.data.attributes.fileSize,
                fileType: data.data.attributes.fileType,
                fileMime: data.data.attributes.fileMime,
                fileThumbnail: data.data.attributes.fileThumbnail
            });

            pushRecords(issue.get('files'), [upload]);
        } catch (e) {
            this.notifyError(this.intl.t("views.app.issue.detail.file.uploadfailed"));
            upload.rollback();
        }
    });
}
