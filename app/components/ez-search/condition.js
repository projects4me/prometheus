/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { condition, isComplete, remove, replace } from 'prometheus/utils/query/ast';
import { defaultFor, forType, operator as findOperator } from 'prometheus/utils/query/operators';

/**
 * One row of the builder: field, operator, value and remove. Edits go through the `ast` helpers on
 * `@tree` and come out as `@onChange(newTree)`.
 *
 * Arguments: `@condition`, `@tree` (the root), `@schema`, `@errors` and `@onChange(tree)`.
 *
 * @class Condition
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchConditionComponent extends Component {
    @service intl;

    get fields() {
        return this.args.schema?.fields || [];
    }

    get field() {
        return this.fields.find((field) => field.id === this.args.condition.field) || null;
    }

    /**
     * The field for the value editor: fields that carry their own `values` keep them, the others get the
     * schema's values for their `valueSource`.
     *
     * @property valueField
     * @type Object
     */
    get valueField() {
        let field = this.field;

        if (!field || field.values || !this.args.schema?.valuesFor) {
            return field;
        }

        return { ...field, values: this.args.schema.valuesFor(field) };
    }

    /**
     * The operators valid for the field's type, with their translated labels.
     *
     * @property operators
     * @type Array
     */
    get operators() {
        if (!this.field) {
            return [];
        }

        return forType(this.field.type).map((entry) => ({ ...entry, label: this.intl.t(entry.labelKey) }));
    }

    get operator() {
        return this.operators.find((entry) => entry.key === this.args.condition.operator) || null;
    }

    get isIncomplete() {
        return !isComplete(this.args.condition);
    }

    /**
     * The serializer's refusals of this row, translated.
     *
     * @property messages
     * @type Array
     */
    get messages() {
        return (this.args.errors || [])
            .filter((error) => error.nodeId === this.args.condition.id)
            .map((error) => this.intl.t(`components.ezSearch.errors.${error.code}`, error.params || {}));
    }

    emit(node) {
        this.args.onChange?.(replace(this.args.tree, this.args.condition.id, node));
    }

    /**
     * Change the field: the operator goes back to the type's default and a value that does not fit is cleared.
     *
     * @method setField
     * @param {Object} field
     */
    @action
    setField(field) {
        let { id } = this.args.condition;

        if (!field) {
            this.emit(condition('', '', null, id));
            return;
        }

        if (this.field && this.field.type === field.type) {
            let value = this.field.valueSource === field.valueSource ? this.args.condition.value : null;
            this.emit(condition(field.id, this.args.condition.operator, value, id));
            return;
        }

        this.emit(condition(field.id, defaultFor(field.type).key, null, id));
    }

    /**
     * Change the operator; the value stays when the new operator takes the same shape of value.
     *
     * @method setOperator
     * @param {Object} entry
     */
    @action
    setOperator(entry) {
        let { id, field, value } = this.args.condition;
        let previous = findOperator(this.args.condition.operator);
        let fits = entry && previous && previous.arity === entry.arity;

        this.emit(condition(field, entry ? entry.key : '', fits ? value : null, id));
    }

    @action
    setValue(value) {
        let { id, field, operator } = this.args.condition;

        this.emit(condition(field, operator, value, id));
    }

    @action
    removeRow() {
        this.args.onChange?.(remove(this.args.tree, this.args.condition.id));
    }
}
