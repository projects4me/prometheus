/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * Mounts a Tiptap editor on an element (through the docs-editor modifier). It doesn't save anything.
 *
 * Args: @content (initial HTML), @editable (default true), @extensions (extra extensions),
 * @onReady (called with the editor).
 *
 * @class DocsEditorComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class DocsEditorComponent extends Component {
  /**
   * Whether the document can be edited.
   *
   * @property editable
   * @type Boolean
   */
  get editable() {
    return this.args.editable !== false;
  }
}
