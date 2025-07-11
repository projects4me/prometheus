/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Query group component for handling nested rule groups in the native query builder.
 * Manages a collection of rules with AND/OR conditions.
 *
 * @class QueryGroup
 * @namespace Prometheus.Components.QueryBuilderNative
 * @extends Glimmer.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class QueryGroupComponent extends Component {

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
     * Add a new rule to this group
     *
     * @method addRule
     * @action
     */
    @action
    addRule() {
        const newRule = {
            id: `rule_${Date.now()}`,
            field: '',
            operator: '',
            value: '',
            type: 'string'
        };

        const updatedGroup = {
            ...this.args.group,
            rules: [...this.args.group.rules, newRule]
        };

        this.args.onUpdate('rules', updatedGroup.rules);
    }

    /**
     * Remove a rule from this group
     *
     * @method removeRule
     * @param {String} ruleId
     * @action
     */
    @action
    removeRule(ruleId) {
        const updatedRules = this.args.group.rules.filter(rule => rule.id !== ruleId);
        this.args.onUpdate('rules', updatedRules);
    }

    /**
     * Update a rule in this group
     *
     * @method updateRule
     * @param {String} ruleId
     * @param {String} property
     * @param {*} value
     * @action
     */
    @action
    updateRule(ruleId, property, value) {
        const updatedRules = this.args.group.rules.map(rule => {
            if (rule.id === ruleId) {
                const updatedRule = { ...rule, [property]: value };
                
                // Update field type when field changes
                if (property === 'field') {
                    const field = this.availableFields.find(f => f.id === value);
                    if (field) {
                        updatedRule.type = field.type;
                        updatedRule.operator = ''; // Reset operator when field changes
                        updatedRule.value = ''; // Reset value when field changes
                    }
                }
                
                return updatedRule;
            }
            return rule;
        });

        this.args.onUpdate('rules', updatedRules);
    }

    /**
     * Update the condition (AND/OR) for this group
     *
     * @method updateCondition
     * @param {String} condition
     * @action
     */
    @action
    updateCondition(condition) {
        this.args.onUpdate('condition', condition);
    }

    /**
     * Remove this entire group
     *
     * @method removeGroup
     * @action
     */
    @action
    removeGroup() {
        this.args.onRemove();
    }

    /**
     * Add a nested group to this group
     *
     * @method addNestedGroup
     * @action
     */
    @action
    addNestedGroup() {
        const newGroup = {
            id: `group_${Date.now()}`,
            condition: 'AND',
            rules: []
        };

        const updatedRules = [...this.args.group.rules, newGroup];
        this.args.onUpdate('rules', updatedRules);
    }

    /**
     * Get operators for a specific field type
     *
     * @method getOperatorsForField
     * @param {String} fieldId
     * @return {Array}
     */
    getOperatorsForField(fieldId) {
        const field = this.availableFields.find(f => f.id === fieldId);
        return field?.operators || [];
    }
}
