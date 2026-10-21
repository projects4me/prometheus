/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Editor from '@toast-ui/editor';

/**
 * Renders markdown into the element with the toastui viewer. The viewer sanitizes the html it produces,
 * so script content of a message is never executed.
 *
 * @class RenderMarkdown
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class RenderMarkdown extends Modifier {
    /**
     * The viewer of the element
     *
     * @property viewer
     * @type Object
     * @private
     */
    viewer = null;

    /**
     * Creates the viewer on the first run and updates its markdown on the next ones
     *
     * @method didReceiveArguments
     * @private
     */
    didReceiveArguments() {
        let markdown = this.args.positional[0] ?? '';
        if (this.viewer) {
            this.viewer.setMarkdown(markdown);
            return;
        }
        this.viewer = Editor.factory({
            el: this.element,
            viewer: true,
            useDefaultHTMLSanitizer: true,
            initialValue: markdown
        });
    }

    /**
     * Destroys the viewer with the element
     *
     * @method willRemove
     * @private
     */
    willRemove() {
        this.viewer?.destroy?.();
        this.viewer = null;
    }
}
