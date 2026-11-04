/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import jQuery from 'jquery';
import AclStub from '../../stub-services/acl-stub';

// a loadable data URL (the path becomes a fragment), so the browser never reports a native image load error
const HOST = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E#';

class StoreStub extends Service {
    queries = [];
    pending = null;
    fail = false;

    query(modelName, options) {
        this.queries.push([modelName, options]);
        if (this.fail) {
            return Promise.reject(new Error('failed'));
        }
        const result = { objectAt: () => EmberObject.create({ downloadLink: 'tok' + options.id }) };
        return this.pending ? this.pending.then(() => result) : Promise.resolve(result);
    }

    adapterFor() {
        return { host: HOST };
    }
}

module('Integration | Component | issue/file-preview', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:store', StoreStub);
        this.store = this.owner.lookup('service:store');
        this.downloaded = [];
        this.set('close', () => {});
        this.set('download', (file) => this.downloaded.push(file));
    });

    hooks.afterEach(function () {
        jQuery('.modal-backdrop').remove();
        jQuery('body').removeClass('modal-open');
    });

    const renderPreview = (context, mime, id = '1') => {
        context.set('file', EmberObject.create({ id, name: 'file', fileMime: mime }));
        return render(hbs`<Issue::FilePreview @file={{this.file}} @onClose={{this.close}} @onDownload={{this.download}} />`);
    };

    test('it shows an image in an img element', async function (assert) {
        await renderPreview(this, 'image/png');
        assert.dom('img.file-preview-image').hasAttribute('src', HOST + '/preview/get/tok1');
        assert.deepEqual(this.store.queries, [['upload', { id: '1', download: true }]]);
    });

    test('it shows a pdf in an iframe', async function (assert) {
        await renderPreview(this, 'application/pdf');
        assert.dom('iframe.file-preview-frame').hasAttribute('src', HOST + '/preview/get/tok1');
        assert.dom('iframe.file-preview-frame').hasAttribute('sandbox', '');
    });

    test('it does not frame scriptable text types such as text/html', async function (assert) {
        await renderPreview(this, 'text/html');
        assert.dom('iframe').doesNotExist();
        assert.dom('.file-preview-unsupported').exists();
        assert.strictEqual(this.store.queries.length, 0, 'no token requested');
    });

    test('it offers a download instead of a preview for video', async function (assert) {
        await renderPreview(this, 'video/mp4');
        assert.dom('.file-preview-unsupported').exists();
        assert.dom('video, audio').doesNotExist();
        assert.strictEqual(this.store.queries.length, 0, 'no token requested');
    });

    test('it offers a download instead of a preview for audio', async function (assert) {
        await renderPreview(this, 'audio/mpeg');
        assert.dom('.file-preview-unsupported').exists();
        assert.dom('video, audio').doesNotExist();
        assert.strictEqual(this.store.queries.length, 0, 'no token requested');
    });

    test('it shows an error when the image itself fails to load', async function (assert) {
        await renderPreview(this, 'image/png');
        document.querySelector('img.file-preview-image').dispatchEvent(new Event('error'));
        await settled();
        assert.dom('.file-preview-error').exists();
        assert.dom('img.file-preview-image').doesNotExist();
    });

    test('it shows an error when the response has no token', async function (assert) {
        this.store.query = () => Promise.resolve({ objectAt: () => undefined });
        await renderPreview(this, 'image/png');
        assert.dom('.file-preview-error').exists();
    });

    test('it shows no preview and downloads for an unsupported type without requesting a token', async function (assert) {
        await renderPreview(this, 'application/zip');
        assert.dom('.file-preview-unsupported').includesText('No preview available for this file type');
        assert.strictEqual(this.store.queries.length, 0, 'no token requested');
        await jQuery('.file-preview-unsupported button').trigger('click');
        await settled();
        assert.strictEqual(this.downloaded.length, 1, 'download flow called');
    });

    test('it shows a loading state, then the file', async function (assert) {
        let release;
        this.store.pending = new Promise((resolve) => (release = resolve));
        const rendering = renderPreview(this, 'image/png');
        await waitFor('.file-preview-loading');
        assert.dom('.file-preview-loading').exists();
        release();
        await rendering;
        await settled();
        assert.dom('.file-preview-loading').doesNotExist();
        assert.dom('img.file-preview-image').exists();
    });

    test('it shows an error when the request fails', async function (assert) {
        this.store.fail = true;
        await renderPreview(this, 'image/png');
        assert.dom('.file-preview-error').includesText('The file could not be loaded');
        assert.dom('img.file-preview-image').doesNotExist();
    });
});
