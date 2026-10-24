/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { referenceImageSources, replaceUploadImages, uploadImageIds, uploadReference } from 'prometheus/utils/upload-reference';

module('Unit | Utility | upload-reference', function () {
    test('an upload reference has no host or token', function (assert) {
        assert.strictEqual(uploadReference('42'), 'upload:42');
    });

    test('it lists the upload ids of the images once', function (assert) {
        let markdown = 'See ![a.png](upload:1) and ![b.png](upload:2), ![a.png](upload:1) [link](upload:3) ![c](http://x/c.png)';
        assert.deepEqual(uploadImageIds(markdown), ['1', '2']);
        assert.deepEqual(uploadImageIds(null), []);
    });

    test('it replaces the upload images only', function (assert) {
        let markdown = 'See ![a.png](upload:1) ![c](http://x/c.png)';
        assert.strictEqual(replaceUploadImages(markdown, (alt, id) => `${alt}#${id}`), 'See a.png#1 ![c](http://x/c.png)');
    });

    test('it replaces image addresses with their references', function (assert) {
        let references = new Map([['blob:http://app/1', 'upload:1']]);
        let markdown = 'Look ![a.png](blob:http://app/1) ![b](http://x/b.png)';
        assert.strictEqual(referenceImageSources(markdown, references), 'Look ![a.png](upload:1) ![b](http://x/b.png)');
    });
});
