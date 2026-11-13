/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * The value input of an ezSearch condition. It picks the control from the field's type and the
 * operator's arity, and reports the value in the shape `ast.condition` expects: a string, an array
 * for IN and NOT IN, or `[from, to]` for BETWEEN. It never changes `@value`.
 *
 * Arguments: `@field` (a schema field with its `values`), `@operator` (a registry entry), `@value`
 * and `@onChange(value)`.
 *
 * @class ValueEditor
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchValueEditorComponent extends Component {
    @service intl;

    /**
     * The kind of control to show: `none`, `range` (two dates), `numrange` (two typed bounds), `date`, `list` (static options), `csv` (typed, comma separated), `select` or `text`.
     *
     * @property kind
     * @type String
     */
    get kind() {
        let { arity } = this.args.operator || {};
        let type = this.args.field?.type;

        if (!this.args.operator || arity === 0) {
            return 'none';
        }
        if (arity === 2) {
            return type === 'date' ? 'range' : 'numrange';
        }
        if (arity === 'n') {
            return type === 'enum' || type === 'user' ? 'list' : 'csv';
        }
        if (type === 'date') {
            return 'date';
        }

        return type === 'enum' || type === 'user' ? 'select' : 'text';
    }

    get isUser() {
        return this.args.field?.type === 'user';
    }

    get relateType() {
        return this.isUser ? 'relate-user' : 'relate-simple';
    }

    get options() {
        return this.args.field?.values || [];
    }

    get inputType() {
        return this.args.field?.type === 'number' && this.kind !== 'csv' ? 'number' : 'text';
    }

    get placeholder() {
        return this.intl.t(`components.ezSearch.valueEditor.${this.kind === 'csv' ? 'csv' : 'text'}`);
    }

    get listValues() {
        let { value } = this.args;

        if (Array.isArray(value)) {
            return value;
        }

        return value === null || value === undefined || value === '' ? [] : [value];
    }

    get first() {
        let { value } = this.args;

        return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    }

    get from() {
        return Array.isArray(this.args.value) ? (this.args.value[0] ?? '') : '';
    }

    get to() {
        return Array.isArray(this.args.value) ? (this.args.value[1] ?? '') : '';
    }

    // The bound inputs are not two-way owners of the value: changes arrive through `typedFrom` and `typedTo`.
    set from(value) {}

    set to(value) {}

    /**
     * The input type of the typed range bounds: number for number fields, text otherwise.
     *
     * @property boundType
     * @type String
     */
    get boundType() {
        return this.args.field?.type === 'number' ? 'number' : 'text';
    }

    get selectedOne() {
        return this.options.find((option) => String(option.value) === String(this.first)) || null;
    }

    get selectedMany() {
        let values = this.listValues.map(String);

        return this.options.filter((option) => values.includes(String(option.value)));
    }

    /**
     * The text of the text, number and comma separated inputs.
     *
     * @property text
     * @type String
     */
    get text() {
        return this.kind === 'csv' ? this.listValues.join(', ') : this.first;
    }

    set text(value) {
        // Changes are reported from the input event (`typed`); the input never owns the value.
    }

    /**
     * Report what was typed: a string, or an array of the comma separated items for IN and NOT IN.
     *
     * @method typed
     * @param {Event} event
     */
    @action
    typed(event) {
        let { value } = event.target;

        if (this.kind === 'csv') {
            this.emit(
                value
                    .split(',')
                    .map((item) => item.trim())
                    .filter((item) => item !== '')
            );
        } else {
            this.emit(value);
        }
    }

    /**
     * The date format a date control shows and reports.
     *
     * @property dateFormat
     * @type String
     */
    get dateFormat() {
        return DATE_FORMAT;
    }

    emit(value) {
        this.args.onChange?.(value);
    }

    @action
    selectOne(option) {
        this.emit(option ? String(option.value) : '');
    }

    @action
    selectMany(options) {
        this.emit(options.map((option) => String(option.value)));
    }

    @action
    setDate(date) {
        this.emit(date);
    }

    @action
    setFrom(date) {
        this.emit([date, this.to]);
    }

    @action
    setTo(date) {
        this.emit([this.from, date]);
    }

    @action
    typedFrom(event) {
        this.setFrom(event.target.value);
    }

    @action
    typedTo(event) {
        this.setTo(event.target.value);
    }
}
