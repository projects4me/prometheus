/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

/**
 * This component is used to control the inline editing of a field. It provides
 * a display state with an optional ACL-guarded edit trigger, and an edit state
 * with save/cancel controls and optional validation before the @onSave callback
 * is invoked.
 *
 * The component exposes two named blocks:
 *   <:display> — read-only content shown when not editing
 *   <:edit as |f|> — edit content; f is the editFields hash
 *
 * @class AppUiInlineEditableComponent
 * @namespace Prometheus.Components.AppUi
 * @extends Glimmer.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiInlineEditableComponent extends Component {

    /**
     * This service is used to check the access control of the user.
     *
     * @property acl
     * @type Ember.Service
     * @for AppUiInlineEditableComponent
     * @public
     */
    @service acl;

    /**
     * This flag is used to control whether the component is currently in edit
     * mode or display mode. The default value is false.
     *
     * @property isEditing
     * @type Boolean
     * @for AppUiInlineEditableComponent
     * @public
     */
    @tracked isEditing = false;

    /**
     * This property holds the unsaved draft value while the component is in
     * edit mode. It is seeded from @value when the edit session opens and is
     * discarded on cancel.
     *
     * @property draftValue
     * @type mixed
     * @for AppUiInlineEditableComponent
     * @public
     */
    @tracked draftValue = "";

    /**
     * This flag is used to indicate that the save operation is in progress.
     * While true the save and cancel buttons are disabled to prevent double
     * submission. The default value is false.
     *
     * @property isSaving
     * @type Boolean
     * @for AppUiInlineEditableComponent
     * @public
     */
    @tracked isSaving = false;

    /**
     * This property returns the hash that is yielded to the <:edit> named
     * block. It exposes the draft value, model adapter, update callbacks,
     * keydown handler, saving flag and the current validation message so that
     * the field component inside the slot can own its own error display.
     *
     * @property editFields
     * @type Object
     * @for AppUiInlineEditableComponent
     * @public
     */
    get editFields() {
        return {
            value: this.draftValue,
            model: this.draftModel,
            update: this.updateDraft,
            updateDirect: this.updateDraftDirect,
            onKeydown: this.handleEditKeydown,
            saving: this.isSaving,
            message: this.args.message,
        };
    }

    /**
     * This property provides a minimal Ember-style model adapter so that
     * existing create-form components that expect @model and @selectRelated
     * can be reused inside the edit slot without modification. Any .set() call
     * on this object routes to updateDraftDirect, keeping the draft in sync.
     *
     * @property draftModel
     * @type Object
     * @for AppUiInlineEditableComponent
     * @public
     */
    get draftModel() {
        return {
            set: (_field, value) => this.updateDraftDirect(value),
        };
    }

    /**
     * This property is used to check whether the current committed value
     * should be considered non-empty. Strings are trimmed before the check,
     * arrays use their length, and the values 0 and false are treated as
     * meaningful non-empty values.
     *
     * @property hasDisplayValue
     * @type Boolean
     * @for AppUiInlineEditableComponent
     * @public
     */
    get hasDisplayValue() {
        let value = this.args.value;

        if (typeof value === "string") {
            return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        return value !== null && value !== undefined;
    }

    /**
     * This property is used to decide whether to render the richer empty-state
     * row instead of the normal <:display> slot. The empty state is shown when
     * the value is absent and the caller has provided at least @label or
     * @emptyText to give the user context about what the field represents.
     *
     * @property shouldShowEmptyState
     * @type Boolean
     * @for AppUiInlineEditableComponent
     * @public
     */
    get shouldShowEmptyState() {
        return !this.hasDisplayValue && Boolean(this.args.label || this.args.emptyText);
    }

    /**
     * This property returns the hint text displayed inside the empty state.
     * It falls back to the string "Not set" when @emptyText is not provided.
     *
     * @property emptyText
     * @type String
     * @for AppUiInlineEditableComponent
     * @public
     */
    get emptyText() {
        return this.args.emptyText ?? "Not set";
    }

    /**
     * This property determines whether the current user is allowed to enter
     * edit mode. It respects @disabled first, then delegates to the ACL
     * service when @aclContext is provided. If neither is set, editing is
     * always permitted.
     *
     * @property canEdit
     * @type Boolean
     * @for AppUiInlineEditableComponent
     * @public
     */
    get canEdit() {
        if (this.args.disabled) {
            return false;
        }

        let ctx = this.args.aclContext;
        return ctx ? this.acl.checkAccess(ctx) : true;
    }

    /**
     * This method calls the @onClearMessage callback if one has been provided
     * by the caller. It is used internally to dismiss stale validation errors
     * when the edit session state changes.
     *
     * @method _clearMessage
     * @for AppUiInlineEditableComponent
     * @private
     */
    _clearMessage() {
        if (typeof this.args.onClearMessage === "function") {
            this.args.onClearMessage();
        }
    }

    /**
     * This method is fired when the user clicks on the display surface. It
     * opens the edit slot unless the click originated from an interactive
     * child element such as a link, button, or an element marked with the
     * data-no-inline-edit attribute.
     *
     * @method startEditFromDisplay
     * @for AppUiInlineEditableComponent
     * @param {MouseEvent} event
     * @public
     */
    @action
    startEditFromDisplay(event) {
        if (!this.canEdit) {
            return;
        }

        if (event.target.closest?.("a, button, [data-no-inline-edit]")) {
            return;
        }

        this.startEdit();
    }

    /**
     * This method handles keyboard events on the display surface. Pressing
     * Enter or Space opens the edit slot, matching standard button semantics
     * for keyboard accessibility.
     *
     * @method handleDisplayKeydown
     * @for AppUiInlineEditableComponent
     * @param {KeyboardEvent} event
     * @public
     */
    @action
    handleDisplayKeydown(event) {
        if (!this.canEdit) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.startEdit();
        }
    }

    /**
     * This method opens the edit slot and seeds the draft value from the
     * current committed @value. Any leftover validation message from the
     * previous session is cleared before the slot becomes visible.
     *
     * @method startEdit
     * @for AppUiInlineEditableComponent
     * @public
     */
    @action
    startEdit() {
        this.draftValue = this.args.value ?? "";
        this._clearMessage();
        this.isEditing = true;
    }

    /**
     * This method updates the draft value from a native DOM InputEvent, which
     * is emitted by text-like inputs. If a validation message is currently
     * displayed it is cleared immediately so the UI feels responsive.
     *
     * @method updateDraft
     * @for AppUiInlineEditableComponent
     * @param {InputEvent} event
     * @public
     */
    @action
    updateDraft(event) {
        this.draftValue = event.target.value;

        if (this.args.message) {
            this._clearMessage();
        }
    }

    /**
     * This method updates the draft value when the new value arrives directly
     * rather than via a DOM event. It is used by date pickers, power-select,
     * multi-select and the draftModel adapter which all pass the value itself
     * to their onChange or @update callback. If a validation message is
     * currently displayed it is cleared immediately.
     *
     * @method updateDraftDirect
     * @for AppUiInlineEditableComponent
     * @param {mixed} value
     * @public
     */
    @action
    updateDraftDirect(value) {
        this.draftValue = value;

        if (this.args.message) {
            this._clearMessage();
        }
    }

    /**
     * This method handles keyboard events inside the edit slot. Pressing
     * Escape cancels the edit session and pressing Enter confirms the save,
     * unless @submitOnEnter is false or the focus is inside a textarea element.
     *
     * @method handleEditKeydown
     * @for AppUiInlineEditableComponent
     * @param {KeyboardEvent} event
     * @public
     */
    @action
    handleEditKeydown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            this.cancelEdit();
        } else if (
            event.key === "Enter" &&
            this.args.submitOnEnter !== false &&
            event.target.tagName !== "TEXTAREA"
        ) {
            event.preventDefault();
            this.commitSave();
        }
    }

    /**
     * This method cancels the current edit session and discards the draft
     * value. Any active validation message is also cleared. The method is a
     * no-op while a save is in progress.
     *
     * @method cancelEdit
     * @for AppUiInlineEditableComponent
     * @public
     */
    @action
    cancelEdit() {
        if (this.isSaving) {
            return;
        }

        this._clearMessage();
        this.isEditing = false;
    }

    /**
     * This method validates the draft value and, if validation passes, calls
     * @onSave with the draft. The component stays in edit mode when validation
     * fails or when the save throws an error; errors surfaced via the caller's
     * errorManager or toast service. The active element is blurred before
     * validation so that FormField components inside the slot have their
     * shouldValidate flag set via their own focusout handler before the error
     * message is rendered.
     *
     * @method commitSave
     * @for AppUiInlineEditableComponent
     * @public
     */
    @action
    async commitSave() {
        if (this.isSaving) {
            return;
        }

        let onSave = this.args.onSave;
        if (typeof onSave !== "function") {
            console.error("AppUi::InlineEditable requires @onSave");
            return;
        }

        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }

        let validate = this.args.validate;
        if (typeof validate === "function") {
            await validate(this.draftValue);

            if (this.args.message) {
                return;
            }
        }

        this.isSaving = true;
        try {
            await onSave(this.draftValue);
            this.isEditing = false;
        } catch {
            // Stay in edit mode; errors are surfaced by the caller.
        } finally {
            this.isSaving = false;
        }
    }
}
