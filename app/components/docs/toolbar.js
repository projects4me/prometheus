/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

/**
 * The formatting toolbar of a Docs editor. Hidden when the editor isn't editable.
 *
 * Args: @editor (the Tiptap editor, from Docs::Editor's @onReady). Yields a slot for extra button groups.
 *
 * @class DocsToolbarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class DocsToolbarComponent extends Component {
  @service intl;

  /**
   * Bumped on every editor transaction so the button states are recomputed.
   *
   * @property version
   * @type Number
   * @private
   */
  @tracked version = 0;

  /**
   * Whether the toolbar shows.
   *
   * @property visible
   * @type Boolean
   */
  get visible() {
    // reading version makes the getter follow the editor
    return (
      this.version >= 0 && !!this.args.editor && this.args.editor.isEditable
    );
  }

  /**
   * The button groups, with their current active and disabled state.
   *
   * @property groups
   * @type Array
   */
  get groups() {
    const editor = this.args.editor;
    if (!editor || this.version < 0) {
      return [];
    }
    const mark = (name, icon, command) => ({
      key: name,
      icon,
      command,
      active: editor.isActive(name),
    });
    const heading = (level) => ({
      key: `h${level}`,
      label: `H${level}`,
      command: (chain) => chain.toggleHeading({ level }),
      active: editor.isActive('heading', { level }),
    });
    const block = (key, name, icon, command) => ({
      key,
      icon,
      command,
      active: editor.isActive(name),
    });
    const table = (key, icon, command) => ({
      key,
      icon,
      command,
      disabled: !editor.isActive('table') && key !== 'insertTable',
    });

    return [
      [
        mark('bold', 'fa-bold', (c) => c.toggleBold()),
        mark('italic', 'fa-italic', (c) => c.toggleItalic()),
        mark('underline', 'fa-underline', (c) => c.toggleUnderline()),
        mark('strike', 'fa-strikethrough', (c) => c.toggleStrike()),
      ],
      [heading(1), heading(2), heading(3)],
      [
        block('bulletList', 'bulletList', 'fa-list-ul', (c) =>
          c.toggleBulletList(),
        ),
        block('orderedList', 'orderedList', 'fa-list-ol', (c) =>
          c.toggleOrderedList(),
        ),
        block('taskList', 'taskList', 'fa-check-square-o', (c) =>
          c.toggleTaskList(),
        ),
        block('blockquote', 'blockquote', 'fa-quote-right', (c) =>
          c.toggleBlockquote(),
        ),
        block('codeBlock', 'codeBlock', 'fa-code', (c) => c.toggleCodeBlock()),
        block('link', 'link', 'fa-link', null),
      ],
      [
        table('insertTable', 'fa-table', (c) =>
          c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
        ),
        table('addRow', 'fa-plus', (c) => c.addRowAfter()),
        table('removeRow', 'fa-minus', (c) => c.deleteRow()),
        table('addColumn', 'fa-plus-square-o', (c) => c.addColumnAfter()),
        table('removeColumn', 'fa-minus-square-o', (c) => c.deleteColumn()),
      ],
    ];
  }

  /**
   * @method refresh
   */
  @action
  refresh() {
    this.version += 1;
  }

  /**
   * Runs a button's command, or asks for the address when the button is the link.
   *
   * @method run
   * @param {Object} button
   */
  @action
  run(button) {
    const editor = this.args.editor;
    if (button.key === 'link') {
      this.toggleLink(editor);
      return;
    }
    button.command(editor.chain().focus()).run();
  }

  /**
   * Removes the link at the cursor, or sets one from the typed address.
   *
   * @method toggleLink
   * @param {Editor} editor
   * @private
   */
  toggleLink(editor) {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = (
      window.prompt(this.intl.t('components.docs.toolbar.linkPrompt')) || ''
    ).trim();
    if (href) {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
  }
}
