/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEditorEmpty } from 'prometheus/utils/ui/editor-empty';

/**
 * The standard rich-text component, wrapping AppUi::ToastUi. It is controlled: @value in, @onChange(value) out.
 * The form chrome is optional and by composition: @label (FormFields::Label), @aclContext (AccessControl),
 * @message and @validate (on blur). Without them it is a bare box, such as a comment composer. With @readonly it
 * shows the content in the sanitized Toast UI viewer. @editType (wysiwyg unless given) picks the editing mode;
 * markdown keeps text such as a prompt exactly as typed, with no WYSIWYG round trip.
 *
 * @class AppUiEditorComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiEditorComponent extends Component {
    /**
     * Set once the editor has lost focus, so a required message is not shown before the user has been in it
     *
     * @property shouldValidate
     * @type Boolean
     * @private
     */
    @tracked shouldValidate = false;

    /**
     * Whether the message is shown: there is one and the editor has been left
     *
     * @method get
     * @returns Boolean
     */
    get showMessage() {
        return Boolean(this.args.message) && this.shouldValidate;
    }

    /**
     * Hands the new content (not an event) to @onChange, unless the editor is disabled
     *
     * @method change
     * @param {String} value
     * @param {Array} mentionedIssues
     */
    @action
    change(value, mentionedIssues) {
        if (this.args.disabled) {
            return;
        }
        this.args.onChange?.(value, mentionedIssues);
    }

    /**
     * Calls @onSubmit on Ctrl/⌘+Enter, unless the editor is disabled, the content is empty (nothing is sent, the
     * caller is not told) or a suggestion menu is open and the key belongs to it
     *
     * @method submit
     * @param {String} value
     * @param {Boolean} allowed false while a suggestion menu is open
     */
    @action
    submit(value, allowed) {
        if (!this.args.disabled && allowed !== false && !isEditorEmpty(value)) {
            this.args.onSubmit(value);
        }
    }

    /**
     * On blur: starts showing the message, validates the content and calls @onBlur
     *
     * @method blur
     */
    @action
    blur() {
        this.shouldValidate = true;
        this.args.validate?.(this.args.value ?? '');
        this.args.onBlur?.();
    }
}
