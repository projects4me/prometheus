/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';

/**
 * Resolves what is needed to show an upload: the address of its full image.
 * Components use this service instead of calling the API themselves.
 *
 * @class UploadPreviewService
 * @namespace Prometheus.Services
 * @extends Ember.service
 */
export default class UploadPreviewService extends Service {
    @service store;

    /**
     * The address of the full image of an upload, it needs a download token from the API
     *
     * @method previewUrl
     * @param {String} uploadId
     * @return {Promise} resolves to the address
     * @public
     */
    async previewUrl(uploadId) {
        let uploads = await this.store.query('upload', { id: uploadId, download: true });
        let downloadLink = uploads.objectAt(0).get('downloadLink');
        return this.store.adapterFor('upload').host + '/preview/get/' + downloadLink;
    }
}
