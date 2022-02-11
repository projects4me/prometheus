/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | attachment-icon', function (hooks) {
    setupRenderingTest(hooks);
    let scenarios = [
        ['text/presentation', 'fa fa-file-powerpoint-o'],
        ['text/powerpoint', 'fa fa-file-powerpoint-o'],
        ['text/document', 'fa fa-file-word-o'],
        ['text/word', 'fa fa-file-word-o'],
        ['text/excel', 'fa fa-file-excel-o'],
        ['text/spreadsheet', 'fa fa-file-excel-o'],
        ['text/pdf', 'fa fa-file-pdf-o'],
        ['archive/zip', 'fa fa-file-archive-o'],
        ['archive/tar', 'fa fa-file-archive-o'],
        ['archive/rar', 'fa fa-file-archive-o'],
        ['archive/compress', 'fa fa-file-archive-o'],
        ['audio/mp3', 'fa fa-file-audio-o'],
        ['application/php', 'fa fa-file-code-o'],
        ['image/jpeg', 'fa fa-file-image-o'],
        ['text/html', 'fa fa-file-text-o'],
        ['video/mpeg', 'fa fa-file-video-o'],
        ['font/ttf', 'fa fa-font'],
        ['something/else', 'fa fa-file-o'],
        ['code/file', 'fa fa-file-o']
    ];

    test('it renders', async function (assert) {
        for (var i = 0; i < scenarios.length; i++) {
            this.set('inputValue', scenarios[i][0]);
            await render(hbs`
                <AppUi::AttachmentIcon 
                    @mime={{this.inputValue}}
                />
            `);

            // Accessing 'i' tag inside span element and assertion is done on the basis of class name. 
            assert.equal(this.element.querySelector('span i').getAttribute('class'), `${scenarios[i][1]}`);
        }
    });
});
