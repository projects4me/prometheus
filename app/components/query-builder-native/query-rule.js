/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Individual query rule component for the native query builder.
 * Handles a single field-operator-value condition.
 *
 * @class QueryRule
 * @namespace Prometheus.Components.QueryBuilderNative
 * @extends Glimmer.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class QueryRuleComponent extends Component {

    /**
     * The intl service for translations
     *
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * Get available fields from filters
     *
     * @property availableFields
     * @type Array
     * @readonly
     */
    get availableFields() {
        return this.args.filters || [];
    }

    /**
     * Get the current field definition
     *
     * @property currentField
     * @type Object
     * @readonly
     */
    get currentField() {
        return this.availableFields.find(field => field.id === this.args.rule.field);
    }

    /**
     * Get available operators for the current field
     *
     * @property availableOperators
     * @type Array
     * @readonly
     */
    get availableOperators() {
        if (!this.currentField) return [];
        return this.currentField.operators || [];
    }

    /**
     * Get operator display mapping
     *
     * @property operatorLabels
     * @type Object
     * @readonly
     */
    get operatorLabels() {
        return {
            'equal': this.intl.t('views.components.queryBuilder.operators.equals'),
            'not_equal': this.intl.t('views.components.queryBuilder.operators.notEquals'),
            'less': this.intl.t('views.components.queryBuilder.operators.lessThan'),
            'greater': this.intl.t('views.components.queryBuilder.operators.greaterThan'),
            'less_or_equal': this.intl.t('views.components.queryBuilder.operators.lessThanOrEquals'),
            'greater_or_equal': this.intl.t('views.components.queryBuilder.operators.greaterThanOrEquals'),
            'contains': this.intl.t('views.components.queryBuilder.operators.contains'),
            'not_contains': 'Not ' + this.intl.t('views.components.queryBuilder.operators.contains'),
            'begins_with': this.intl.t('views.components.queryBuilder.operators.starts'),
            'not_begins_with': 'Not ' + this.intl.t('views.components.queryBuilder.operators.starts'),
            'ends_with': this.intl.t('views.components.queryBuilder.operators.ends'),
            'not_ends_with': 'Not ' + this.intl.t('views.components.queryBuilder.operators.ends'),
            'between': this.intl.t('views.components.queryBuilder.operators.between'),
            'not_between': 'Not ' + this.intl.t('views.components.queryBuilder.operators.between'),
            'is_null': this.intl.t('views.components.queryBuilder.operators.null'),
            'is_not_null': 'Not ' + this.intl.t('views.components.queryBuilder.operators.null'),
            'is_empty': this.intl.t('views.components.queryBuilder.operators.empty'),
            'is_not_empty': 'Not ' + this.intl.t('views.components.queryBuilder.operators.empty'),
            'in': 'In',
            'not_in': 'Not In'
        };
    }

    /**
     * Check if the current operator requires a value input
     *
     * @property requiresValue
     * @type Boolean
     * @readonly
     */
    get requiresValue() {
        const noValueOperators = ['is_null', 'is_not_null', 'is_empty', 'is_not_empty'];
        return !noValueOperators.includes(this.args.rule.operator);
    }

    /**
     * Check if the current operator requires two values (like BETWEEN)
     *
     * @property requiresTwoValues
     * @type Boolean
     * @readonly
     */
    get requiresTwoValues() {
        const twoValueOperators = ['between', 'not_between'];
        return twoValueOperators.includes(this.args.rule.operator);
    }

    /**
     * Get placeholder text for value input
     *
     * @property valuePlaceholder
     * @type String
     * @readonly
     */
    get valuePlaceholder() {
        if (!this.currentField) return this.intl.t('views.components.queryBuilder.rule.valuePlaceholders.text');
        
        switch (this.currentField.type) {
            case 'date':
                return this.intl.t('views.components.queryBuilder.rule.valuePlaceholders.date');
            case 'number':
                return this.intl.t('views.components.queryBuilder.rule.valuePlaceholders.number');
            case 'string':
            default:
                return this.intl.t('views.components.queryBuilder.rule.valuePlaceholders.text');
        }
    }

    /**
     * Update field selection
     *
     * @method updateField
     * @param {Event} event
     * @action
     */
    @action
    updateField(event) {
        const fieldId = event.target.value;
        this.args.onUpdate('field', fieldId);
    }

    /**
     * Update operator selection
     *
     * @method updateOperator
     * @param {Event} event
     * @action
     */
    @action
    updateOperator(event) {
        const operator = event.target.value;
        this.args.onUpdate('operator', operator);
    }

    /**
     * Update value input
     *
     * @method updateValue
     * @param {Event} event
     * @action
     */
    @action
    updateValue(event) {
        const value = event.target.value;
        this.args.onUpdate('value', value);
    }

    /**
     * Remove this rule
     *
     * @method removeRule
     * @action
     */
    @action
    removeRule() {
        this.args.onRemove();
    }

    /**
     * Get input type for value field
     *
     * @property valueInputType
     * @type String
     * @readonly
     */
    get valueInputType() {
        if (!this.currentField) return 'text';
        
        switch (this.currentField.type) {
            case 'date':
                return 'date';
            case 'number':
                return 'number';
            case 'string':
            default:
                return 'text';
        }
    }

    /**
     * Check if field has predefined values (select options)
     *
     * @property hasSelectOptions
     * @type Boolean
     * @readonly
     */
    get hasSelectOptions() {
        return this.currentField && 
               this.currentField.input === 'select' && 
               this.currentField.values;
    }

    /**
     * Get select options for the current field
     *
     * @property selectOptions
     * @type Array
     * @readonly
     */
    get selectOptions() {
        if (!this.hasSelectOptions) return [];
        
        const values = this.currentField.values;
        if (Array.isArray(values)) {
            return values;
        } else if (typeof values === 'object') {
            return Object.entries(values).map(([key, value]) => ({
                value: key,
                label: value
            }));
        }
        
        return [];
    }
}
