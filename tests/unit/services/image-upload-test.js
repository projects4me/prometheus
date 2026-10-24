/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

function image(name, type = 'image/png', size = 10) {
    return new File([new Uint8Array(size)], name, { type });
}

module('Unit | Service | image-upload', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    test('it uploads the image as an upload of the record and resolves to its reference', async function (assert) {
        let service = this.owner.lookup('service:image-upload');

        let image1 = await service.upload(image('shot.png'), 'idea', '7');

        let upload = this.server.db.uploads.findBy({ name: 'shot.png' });
        assert.strictEqual(upload.relatedTo, 'idea');
        assert.strictEqual(upload.relatedId, '7');
        assert.deepEqual(image1, { reference: `upload:${upload.id}`, name: 'shot.png' });
    });

    test('an image without a name is named after its type', async function (assert) {
        let service = this.owner.lookup('service:image-upload');

        let result = await service.upload(new Blob([new Uint8Array(10)], { type: 'image/webp' }), 'idea', '7');

        assert.strictEqual(result.name, 'image.webp');
    });

    test('only png, jpg, gif and webp images are uploaded', async function (assert) {
        let service = this.owner.lookup('service:image-upload');

        for (let type of ['image/svg+xml', 'application/pdf']) {
            await assert.rejects(service.upload(image('file', type), 'idea', '7'), error => error.reason === 'type');
        }
        assert.strictEqual(this.server.db.uploads.length, 0);
    });

    test('a too large image is not uploaded', async function (assert) {
        let service = this.owner.lookup('service:image-upload');

        await assert.rejects(service.upload(image('big.png', 'image/png', service.maxFileSize + 1), 'idea', '7'), error => error.reason === 'size');
    });

    test('a failed upload rejects', async function (assert) {
        this.server.post('/upload', {}, 403);
        let service = this.owner.lookup('service:image-upload');

        await assert.rejects(service.upload(image('shot.png'), 'idea', '7'), error => error.reason === 'upload');
    });
});
