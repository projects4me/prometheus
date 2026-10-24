/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | initialize-toastui', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let onContentChange = () => true;
        this.set('onContentChange', onContentChange);

        await render(hbs`
            <div {{initialize-toastui onContentChange=this.onContentChange}}> </div>
        `);

        assert.ok(true);
    });

    test('it emits HTML by default and markdown with output=markdown', async function (assert) {
        let html = [];
        let markdown = [];
        this.set('onHtml', content => html.push(content));
        this.set('onMarkdown', content => markdown.push(content));

        await render(hbs`
            <div id="html-editor" {{initialize-toastui editType="wysiwyg" onContentChange=this.onHtml}}></div>
            <div id="md-editor" {{initialize-toastui editType="wysiwyg" output="markdown" onContentChange=this.onMarkdown}}></div>
        `);
        for (let id of ['html-editor', 'md-editor']) {
            let editable = document.querySelector(`#${id} .tui-editor-contents[contenteditable="true"]`);
            editable.focus();
            document.execCommand('insertHTML', false, '<h2>Title</h2><p><b>bold</b></p>');
        }
        await new Promise(resolve => setTimeout(resolve, 400));
        await settled();

        assert.ok(html.pop().includes('<h2>'), 'the default is HTML');
        let md = markdown.pop();
        assert.ok(md.includes('## Title') && md.includes('**bold**'), 'markdown output');
    });

    test('a pasted image is inserted from what onImage resolves to', async function (assert) {
        let received = [];
        this.set('onContentChange', () => {});
        this.set('onImage', async (blob) => {
            received.push(blob.name);
            return { url: 'http://img/shot.png', alt: 'shot.png' };
        });
        await render(hbs`<div {{initialize-toastui editType="wysiwyg" onContentChange=this.onContentChange onImage=this.onImage}}></div>`);

        let editable = document.querySelector('.tui-editor-contents[contenteditable="true"]');
        editable.focus();
        let data = new DataTransfer();
        data.items.add(new File([new Uint8Array(10)], 'shot.png', { type: 'image/png' }));
        editable.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
        await settled();

        assert.deepEqual(received, ['shot.png']);
        assert.dom('.tui-editor-contents img').hasAttribute('src', 'http://img/shot.png');
    });
});
