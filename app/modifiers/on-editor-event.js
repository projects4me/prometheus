/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';

/**
 * Calls the callback on every event of a Tiptap editor, and stops when the editor changes or the element goes.
 *
 * Usage: `{{on-editor-event @editor "transaction" this.refresh}}`
 *
 * @class OnEditorEventModifier
 * @namespace Prometheus.Modifiers
 */
export default modifier((element, [editor, eventName, callback]) => {
  if (!editor) {
    return undefined;
  }
  editor.on(eventName, callback);
  return () => editor.off(eventName, callback);
});
