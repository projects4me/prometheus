/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, waitUntil } from '@ember/test-helpers';
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

    test('ArrowDown then Enter inserts the second suggestion of a mention menu', async function (assert) {
        this.set('onContentChange', () => {});
        this.set('emojis', [{ id: 'smile', name: 'smile' }, { id: 'smirk', name: 'smirk' }]);
        await render(hbs`<div {{initialize-toastui editType="wysiwyg" onContentChange=this.onContentChange translatedEmojis=this.emojis}}></div>`);

        let editable = document.querySelector('.tui-editor-contents[contenteditable="true"]');
        let key = (type, key, keyCode) => editable.dispatchEvent(new KeyboardEvent(type, { key, keyCode, bubbles: true, cancelable: true }));
        editable.focus();
        document.execCommand('insertText', false, ':smi');
        key('keydown', 'i', 73);
        key('keyup', 'i', 73);
        await settled();

        let items = document.querySelectorAll('.tribute-container li');
        assert.strictEqual(items.length, 2, 'the emoji menu lists both matches');
        assert.dom(items[0]).hasClass('highlight', 'the first item is highlighted');
        let second = items[1].textContent.includes('smirk') ? '\u{1F60F}' : '\u{1F604}';

        key('keydown', 'ArrowDown', 40);
        assert.dom(items[1]).hasClass('highlight', 'ArrowDown highlights the second item');
        assert.notStrictEqual(getComputedStyle(items[1].querySelector('a')).backgroundColor,
            getComputedStyle(items[0].querySelector('a')).backgroundColor, 'the highlighted item is visibly styled');

        key('keydown', 'Enter', 13);
        await waitUntil(() => editable.textContent.includes(second));

        assert.ok(editable.textContent.includes(second), 'the second suggestion was inserted');
        assert.strictEqual(editable.querySelectorAll('div, p').length, 1, 'Enter did not add a line');
    });
});
