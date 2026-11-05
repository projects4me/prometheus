/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { expressionOf } from 'prometheus/utils/workflow/node-config';

/**
 * The text-like setting types; they take expressions such as `{issue.subject}` inserted from the payload picker
 *
 * @property TEXT_TYPES
 * @type Array
 * @private
 */
const TEXT_TYPES = ['text', 'longText', 'issuetype'];

/**
 * One setting of a workflow step, drawn by its type: a text or text area with an expression picker, a cron, a
 * payload field picker, an actor picker, a condition list or the cases of a switch.
 *
 * @class ConfigField
 * @namespace Prometheus.Components.Workflow
 * @extends Component
 *
 * @argument {Object} field the setting, as { name, type, required }
 * @argument {*} value the setting's value in the draft
 * @argument {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @argument {Array} users the user options
 * @argument {Array} agents the Agent records
 * @argument {String} placeholder the hint an empty text setting shows
 * @argument {Boolean} locked
 * @argument {Function} onChange called with (name, value)
 */
export default class ConfigFieldComponent extends Component {
    /**
     * The text the input shows, for text-like settings
     *
     * @property text
     * @type String
     * @public
     */
    get text() {
        return typeof this.args.value === 'string' ? this.args.value : '';
    }

    /**
     * The inputs bind two-way to the text; the draft is the source, so a typed value goes to it
     *
     * @property text
     * @type String
     * @public
     */
    set text(value) {
        this.args.onChange(this.args.field.name, value);
    }

    /**
     * @property type
     * @type String
     * @public
     */
    get type() {
        return this.args.field.type;
    }

    /**
     * Whether the setting is typed as text and takes expressions
     *
     * @property isText
     * @type Boolean
     * @public
     */
    get isText() {
        return TEXT_TYPES.includes(this.type);
    }

    /**
     * Whether the setting picks a user or an agent
     *
     * @property isActor
     * @type Boolean
     * @public
     */
    get isActor() {
        return this.type === 'user' || this.type === 'agent';
    }

    /**
     * The translation key of the setting's label; its info text uses the same key with `Info`
     *
     * @property labelKey
     * @type String
     * @public
     */
    get labelKey() {
        return `views.app.workflow.config.${this.args.field.name}`;
    }

    /**
     * The payload paths as select options
     *
     * @property pathOptions
     * @type Array
     * @public
     */
    get pathOptions() {
        return (this.args.payloadFields ?? []).map(({ path }) => ({ label: path, value: path }));
    }

    /**
     * The selected payload path, for a field setting
     *
     * @property selectedPath
     * @type Object
     * @public
     */
    get selectedPath() {
        return this.pathOptions.find(option => option.value === this.args.value) ?? null;
    }

    /**
     * @method input
     * @param {Event} event
     * @public
     */
    @action input(event) {
        this.args.onChange(this.args.field.name, event.target.value);
    }

    /**
     * Appends an expression naming the picked payload path to the text
     *
     * @method insertExpression
     * @param {Object} option the picked path
     * @public
     */
    @action insertExpression(option) {
        if (!option?.value) {
            return;
        }
        let separator = this.text === '' || /\s$/.test(this.text) ? '' : ' ';
        this.args.onChange(this.args.field.name, `${this.text}${separator}${expressionOf(option.value)}`);
    }

    /**
     * @method pickPath
     * @param {Object} option
     * @public
     */
    @action pickPath(option) {
        this.args.onChange(this.args.field.name, option?.value ?? '');
    }

    /**
     * @method change
     * @param {*} value
     * @public
     */
    @action change(value) {
        this.args.onChange(this.args.field.name, value);
    }
}
