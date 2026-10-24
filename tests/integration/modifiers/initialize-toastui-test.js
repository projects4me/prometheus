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
});
