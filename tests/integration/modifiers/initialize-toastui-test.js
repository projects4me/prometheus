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

    test('a mention with no matches closes the menu', async function (assert) {
        this.set('onContentChange', () => {});
        this.set('emojis', [{ id: 'smile', name: 'smile' }]);
        await render(hbs`<div {{initialize-toastui editType="wysiwyg" onContentChange=this.onContentChange translatedEmojis=this.emojis}}></div>`);

        let editable = document.querySelector('.tui-editor-contents[contenteditable="true"]');
        let key = (type, key, keyCode) => editable.dispatchEvent(new KeyboardEvent(type, { key, keyCode, bubbles: true, cancelable: true }));
        editable.focus();
        document.execCommand('insertText', false, ':zzq');
        key('keydown', 'q', 81);
        key('keyup', 'q', 81);
        await settled();

        assert.dom('.tribute-container li').doesNotExist('no "No Match Found" item is shown');
        key('keydown', 'Enter', 13);
        await settled();
        assert.strictEqual(editable.querySelectorAll('div, p').length, 2, 'Enter is left to the editor and adds a line');
    });

    test('a changed @value reaches the editor while it is not focused', async function (assert) {
        this.set('noop', () => {});
        this.set('value', '<p>first</p>');
        await render(hbs`<div id="sync-editor" {{initialize-toastui value=this.value onContentChange=this.noop}}></div>`);
        let editable = () => document.querySelector('#sync-editor .tui-editor-contents[contenteditable="true"]');
        assert.ok(editable().textContent.includes('first'));

        this.set('value', '<p>second</p>');
        await settled();
        assert.ok(editable().textContent.includes('second'), 'the editor shows the new value');
    });

    test('resetting @value to an older value restores it after the user edited the editor', async function (assert) {
        this.set('value', '<p>A</p>');
        this.set('echo', content => this.set('value', content));
        await render(hbs`<div id="reset-editor" {{initialize-toastui editType="wysiwyg" value=this.value onContentChange=this.echo}}></div>`);
        let selector = '#reset-editor .tui-editor-contents[contenteditable="true"]';
        let editable = document.querySelector(selector);
        editable.focus();
        document.execCommand('insertText', false, 'B');
        await new Promise(resolve => setTimeout(resolve, 400));
        editable.blur();
        await settled();
        assert.ok(document.querySelector(selector).textContent.includes('B'), 'the user edit is in the editor');

        this.set('value', '<p>A</p>');
        await settled();
        assert.notOk(document.querySelector(selector).textContent.includes('B'), 'the editor is back at A');
    });

    test('a @value that arrives while the editor is focused is applied once focus leaves', async function (assert) {
        this.set('noop', () => {});
        this.set('value', '<p>first</p>');
        await render(hbs`<div id="pending-editor" {{initialize-toastui editType="wysiwyg" value=this.value onContentChange=this.noop}}></div>`);
        let selector = '#pending-editor .tui-editor-contents[contenteditable="true"]';
        let editable = document.querySelector(selector);
        editable.focus();

        this.set('value', '<p>second</p>');
        await settled();
        assert.ok(document.querySelector(selector).textContent.includes('first'), 'the focused editor is left alone');

        document.querySelector(selector).blur();
        await waitUntil(() => document.querySelector(selector).textContent.includes('second'), { timeout: 2000 });
        assert.ok(document.querySelector(selector).textContent.includes('second'), 'the pending value is applied after blur');
    });

    test('an editor without @value keeps what the user typed after it loses focus', async function (assert) {
        this.set('noop', () => {});
        await render(hbs`<div id="free-editor" {{initialize-toastui editType="wysiwyg" onContentChange=this.noop}}></div>`);
        let selector = '#free-editor .tui-editor-contents[contenteditable="true"]';
        let editable = document.querySelector(selector);
        editable.focus();
        document.execCommand('insertText', false, 'typed');
        await new Promise(resolve => setTimeout(resolve, 400));
        editable.blur();
        await new Promise(resolve => setTimeout(resolve, 100));
        await settled();
        assert.ok(document.querySelector(selector).textContent.includes('typed'), 'the text is still there');
    });

    test('a @value that arrives while focus is on a button of the wrapper is applied once focus leaves it', async function (assert) {
        this.set('noop', () => {});
        this.set('value', '<p>first</p>');
        await render(hbs`<div id="btn-editor" {{initialize-toastui editType="wysiwyg" value=this.value onContentChange=this.noop}}></div><button id="outside" type="button">x</button>`);
        let selector = '#btn-editor .tui-editor-contents[contenteditable="true"]';
        let wrapper = document.querySelector('#btn-editor');
        let button = document.createElement('button');
        button.type = 'button';
        wrapper.appendChild(button);
        button.focus();

        this.set('value', '<p>second</p>');
        await settled();
        assert.ok(document.querySelector(selector).textContent.includes('first'), 'the value waits while focus is inside the wrapper');

        document.querySelector('#outside').focus();
        await waitUntil(() => document.querySelector(selector).textContent.includes('second'), { timeout: 2000 });
        assert.ok(true, 'the pending value is applied after focus left the wrapper');
    });

    test('an @initialValue that is not echoed back does not undo what the user typed', async function (assert) {
        this.set('noop', () => {});
        await render(hbs`<div id="init-editor" {{initialize-toastui editType="wysiwyg" initialValue="<p>A</p>" onContentChange=this.noop}}></div>`);
        let selector = '#init-editor .tui-editor-contents[contenteditable="true"]';
        let editable = document.querySelector(selector);
        editable.focus();
        document.execCommand('insertText', false, 'B');
        await new Promise(resolve => setTimeout(resolve, 400));
        editable.blur();
        await new Promise(resolve => setTimeout(resolve, 100));
        await settled();
        assert.ok(document.querySelector(selector).textContent.includes('B'), 'the user edit is kept');
    });

    test('an explicit clearEvent clears only its own editor', async function (assert) {
        this.set('noop', () => {});
        let pubSub = this.owner.lookup('service:pub-sub');
        await render(hbs`
            <div id="ca" {{initialize-toastui initialValue="<p>one</p>" clearEvent="clear-a" onContentChange=this.noop}}></div>
            <div id="cb" {{initialize-toastui initialValue="<p>two</p>" clearEvent="clear-b" onContentChange=this.noop}}></div>
        `);
        pubSub.trigger('clear-a');
        await settled();
        assert.dom('#ca').doesNotIncludeText('one', 'the editor of the event is cleared');
        assert.dom('#cb').includesText('two', 'the other editor is untouched');
    });

    test('a global clearContents does not clear editors with the default clear event', async function (assert) {
        this.set('noop', () => {});
        let pubSub = this.owner.lookup('service:pub-sub');
        await render(hbs`
            <div id="a" {{initialize-toastui initialValue="<p>one</p>" onContentChange=this.noop}}></div>
            <div id="b" {{initialize-toastui initialValue="<p>two</p>" onContentChange=this.noop}}></div>
        `);
        pubSub.trigger('clearContents');
        await settled();
        assert.dom('#a').includesText('one', 'a global clearContents no longer clears editors');
        assert.dom('#b').includesText('two');
    });
});
