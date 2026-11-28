/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { Editor } from '@tiptap/core';
import { docsExtensions } from '../utils/docs/schema';

/**
 * Mounts a Tiptap editor on the element, follows `editable` and destroys the editor on teardown.
 *
 * Named args: content (initial HTML, read once: key the caller on the document to load another), editable, extensions (extra extensions), onReady (called with the editor).
 *
 * @class DocsEditorModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class DocsEditorModifier extends Modifier {
  /**
   * @property editor
   * @type Editor
   * @private
   */
  editor = null;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, () => {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    });
  }

  /**
   * @method modify
   * @param {HTMLElement} element
   * @param {Array} positional not used
   * @param {Object} named the editor options
   * @public
   */
  modify(element, positional, { content, editable, extensions, onReady }) {
    const isEditable = editable !== false;
    if (!this.editor) {
      this.editor = new Editor({
        element,
        content: content || '',
        editable: isEditable,
        extensions: [...docsExtensions(), ...(extensions || [])],
      });
      if (onReady) {
        // after render, so the caller may keep the editor in tracked state the template already read
        const editor = this.editor;
        queueMicrotask(() => {
          if (!editor.isDestroyed) {
            onReady(editor);
          }
        });
      }
    } else if (this.editor.isEditable !== isEditable) {
      this.editor.setEditable(isEditable);
    }
  }
}
