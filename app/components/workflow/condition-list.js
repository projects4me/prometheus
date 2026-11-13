/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { OPERATORS, VALUELESS_OPERATORS } from 'prometheus/utils/workflow/node-config';

/**
 * The filter builder: a list of conditions over the trigger's payload, each a field, an operator and a value. Every
 * condition must hold for the filter to pass.
 *
 * @class ConditionList
 * @namespace Prometheus.Components.Workflow
 * @extends Component
 *
 * @argument {Array} conditions the conditions in the draft, as [{ field, operator, value }]
 * @argument {Array} payloadFields the trigger's payload paths, as [{ path, type }]
 * @argument {Boolean} locked
 * @argument {Function} onChange called with the new list
 */
export default class ConditionListComponent extends Component {
    /**
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * The conditions, each with the options its selects show
     *
     * @property rows
     * @type Array
     * @public
     */
    get rows() {
        let list = Array.isArray(this.args.conditions) ? this.args.conditions : [];
        return list.map((condition, index) => ({
            index,
            condition,
            field: this.fieldOptions.find(option => option.value === condition?.field)
                ?? (condition?.field ? { label: condition.field, value: condition.field } : null),
            operator: this.operatorOptions.find(option => option.value === condition?.operator) ?? null,
            takesValue: !VALUELESS_OPERATORS.includes(condition?.operator)
        }));
    }

    /**
     * @property fieldOptions
     * @type Array
     * @public
     */
    get fieldOptions() {
        return (this.args.payloadFields ?? []).map(({ path }) => ({ label: path, value: path }));
    }

    /**
     * @property operatorOptions
     * @type Array
     * @public
     */
    get operatorOptions() {
        return OPERATORS.map(value => ({ label: this.intl.t(`views.app.workflow.operators.${value}`), value }));
    }

    /**
     * Replaces one condition's key and reports the new list
     *
     * @method _set
     * @param {Number} index
     * @param {String} key
     * @param {String} value
     * @private
     */
    _set(index, key, value) {
        let list = [...(this.args.conditions ?? [])];
        list[index] = { ...list[index], [key]: value };
        this.args.onChange(list);
    }

    /**
     * @method pickField
     * @param {Number} index
     * @param {Object} option
     * @public
     */
    @action pickField(index, option) {
        this._set(index, 'field', option?.value ?? '');
    }

    /**
     * @method pickOperator
     * @param {Number} index
     * @param {Object} option
     * @public
     */
    @action pickOperator(index, option) {
        this._set(index, 'operator', option?.value ?? '');
    }

    /**
     * @method changeValue
     * @param {Number} index
     * @param {Event} event
     * @public
     */
    @action changeValue(index, event) {
        this._set(index, 'value', event.target.value);
    }

    /**
     * @method add
     * @public
     */
    @action add() {
        this.args.onChange([...(this.args.conditions ?? []), { field: '', operator: 'equals', value: '' }]);
    }

    /**
     * @method remove
     * @param {Number} index
     * @public
     */
    @action remove(index) {
        this.args.onChange((this.args.conditions ?? []).filter((condition, at) => at !== index));
    }
}
