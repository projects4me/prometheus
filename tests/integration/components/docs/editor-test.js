/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const CONTENT = [
  '<h1>Title</h1><p>Hello <strong>bold</strong> world</p>',
  '<h2>Second</h2>',
  '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div><p>done</p></div></li></ul>',
  '<table><tbody><tr><th><p>H</p></th></tr><tr><td><p>cell</p></td></tr></tbody></table>',
  '<p><ins data-suggestion-id="s1" data-suggestion-source="agent" data-suggestion-author-id="a1" data-suggestion-reason="typo">added</ins> <del data-suggestion-id="s2">removed</del></p>',
].join('');

module('Integration | Component | docs', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.content = CONTENT;
    this.editable = true;
    this.editor = null;
    this.ready = (editor) => {
      this.set('editor', editor);
    };
  });

  const template = hbs`
        <Docs::Toolbar @editor={{this.editor}} />
        <Docs::Editor @content={{this.content}} @editable={{this.editable}} @onReady={{this.ready}} />
        <Docs::Outline @editor={{this.editor}} />`;

  test('it renders the content, tables, checklists and suggestion marks', async function (assert) {
    await render(template);

    assert.dom('.ProseMirror h1').hasText('Title');
    assert.dom('.ProseMirror strong').hasText('bold');
    assert.dom('.ProseMirror table td').hasText('cell');
    assert
      .dom('.ProseMirror ul[data-type="taskList"] input[type="checkbox"]')
      .isChecked();
    assert
      .dom('.ProseMirror ins.doc-suggestion[data-suggestion-id="s1"]')
      .hasText('added');
    assert
      .dom('.ProseMirror ins.doc-suggestion')
      .hasAttribute('data-suggestion-source', 'agent');
    assert
      .dom('.ProseMirror ins.doc-suggestion')
      .hasAttribute('data-suggestion-author-id', 'a1');
    assert
      .dom('.ProseMirror ins.doc-suggestion')
      .hasAttribute('data-suggestion-reason', 'typo');
    assert
      .dom('.ProseMirror del.doc-suggestion[data-suggestion-id="s2"]')
      .hasText('removed');
  });

  test('a toolbar action applies a mark', async function (assert) {
    await render(template);
    this.editor.commands.setTextSelection({ from: 3, to: 6 });
    await settled();

    assert
      .dom('[data-test-doc-toolbar-button="italic"]')
      .hasAttribute('aria-pressed', 'false');
    await click('[data-test-doc-toolbar-button="italic"]');

    assert.dom('.ProseMirror em').exists();
    assert
      .dom('[data-test-doc-toolbar-button="italic"]')
      .hasAttribute('aria-pressed', 'true');
  });

  test('a toolbar action inserts a table', async function (assert) {
    this.set('content', '<p>x</p>');
    await render(template);
    await click('[data-test-doc-toolbar-button="insertTable"]');

    assert.dom('.ProseMirror table').exists();
  });

  test('read only hides the toolbar and blocks editing', async function (assert) {
    this.set('editable', false);
    await render(template);

    assert.dom('[data-test-doc-toolbar]').doesNotExist();
    assert.false(this.editor.isEditable);
    assert.dom('.ProseMirror').hasAttribute('contenteditable', 'false');
  });

  test('the outline lists the headings and scrolls to one', async function (assert) {
    await render(template);

    assert.dom('[data-test-doc-outline-item]').exists({ count: 2 });
    assert.dom('[data-test-doc-outline-item]').hasText('Title');

    await click('li:nth-child(2) [data-test-doc-outline-item]');
    assert.strictEqual(
      this.editor.state.selection.$from.parent.textContent,
      'Second',
    );

    this.editor.commands.insertContentAt(0, '<h3>Third</h3>');
    await settled();
    assert.dom('[data-test-doc-outline-item]').exists({ count: 3 });
  });

  test('it destroys the editor on teardown', async function (assert) {
    await render(template);
    const editor = this.editor;
    await render(hbs`<div></div>`);

    assert.true(editor.isDestroyed);
  });
});
