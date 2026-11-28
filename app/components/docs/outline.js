/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * A side box listing the headings of a Docs editor's document. Clicking one scrolls to it.
 *
 * Args: @editor (the Tiptap editor, from Docs::Editor's @onReady).
 *
 * @class DocsOutlineComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class DocsOutlineComponent extends Component {
  /**
   * Bumped on every document update so the headings are read again.
   *
   * @property version
   * @type Number
   * @private
   */
  @tracked version = 0;

  /**
   * The headings of the document.
   *
   * @property headings
   * @type Array
   */
  get headings() {
    const editor = this.args.editor;
    const headings = [];
    if (editor && this.version >= 0) {
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading' && node.textContent.trim()) {
          headings.push({
            pos,
            level: node.attrs.level,
            text: node.textContent,
          });
        }
      });
    }
    return headings;
  }

  /**
   * Reads the headings again.
   *
   * @method refresh
   */
  @action
  refresh() {
    this.version += 1;
  }

  /**
   * Scrolls to a heading and puts the cursor in it.
   *
   * @method goTo
   * @param {Object} heading
   * @param {Event} event
   */
  @action
  goTo(heading, event) {
    event.preventDefault();
    const editor = this.args.editor;
    const dom = editor.view.nodeDOM(heading.pos);
    editor.commands.setTextSelection(heading.pos + 1);
    if (dom && dom.scrollIntoView) {
      dom.scrollIntoView({ block: 'start' });
    }
  }
}
