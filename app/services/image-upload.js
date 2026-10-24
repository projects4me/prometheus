/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import UploadFile from 'ember-file-upload/upload-file';
import { FileSource } from 'ember-file-upload/interfaces';
import ENV from 'prometheus/config/environment';
import { uploadReference } from 'prometheus/utils/upload-reference';

/**
 * The image types that can be uploaded
 *
 * @property IMAGE_TYPES
 * @type Array
 * @private
 */
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/**
 * The error of an image that was not uploaded, its reason is `type`, `size` or `upload`
 *
 * @class ImageUploadError
 * @namespace Prometheus.Services
 * @extends Error
 */
export class ImageUploadError extends Error {
    constructor(reason, cause) {
        super(`Image not uploaded: ${reason}`);
        this.reason = reason;
        this.cause = cause;
    }
}

/**
 * Uploads an image as an upload of a record, through the upload adapter, and resolves to the reference
 * markdown keeps to it (see utils/upload-reference).
 *
 * @class ImageUploadService
 * @namespace Prometheus.Services
 * @extends Ember.service
 */
export default class ImageUploadService extends Service {
    @service store;

    /**
     * The largest image that can be uploaded, in bytes
     *
     * @property maxFileSize
     * @type Number
     * @public
     */
    get maxFileSize() {
        return ENV.app.upload.maxFileSize;
    }

    /**
     * Uploads the image as an upload related to the record
     *
     * @method upload
     * @param {Blob} blob the image, a File keeps its name
     * @param {String} relatedTo the module of the record, e.g. `idea`
     * @param {String} relatedId the id of the record
     * @return {Promise} resolves to `{ reference, name }`, rejects with an ImageUploadError
     * @public
     */
    async upload(blob, relatedTo, relatedId) {
        if (!IMAGE_TYPES.includes(blob.type)) {
            throw new ImageUploadError('type');
        }
        if (blob.size > this.maxFileSize) {
            throw new ImageUploadError('size');
        }
        let file = blob.name ? blob : new File([blob], `image.${blob.type.split('/')[1]}`, { type: blob.type });
        let adapter = this.store.adapterFor('upload');
        try {
            let response = await new UploadFile(file, FileSource.Blob).upload({
                url: adapter.buildURL('upload'),
                data: { relatedTo, relatedId },
                headers: adapter.headers
            });
            let { data } = await response.json();
            return { reference: uploadReference(data.id), name: data.attributes.name };
        } catch (error) {
            throw new ImageUploadError('upload', error);
        }
    }
}
