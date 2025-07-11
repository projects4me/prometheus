/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import queryParser from "../../utils/query/parser";

/**
 * Native EmberJS Query Builder component that replaces the jQuery-based implementation.
 * Provides both visual form-based query building and text-based autocomplete input.
 *
 * @class QueryBuilderNative
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class QueryBuilderNativeComponent extends Component {

    /**
     * The intl service for translations
     *
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * Current display mode - 'visual' or 'text'
     *
     * @property mode
     * @type String
     * @tracked
     * @private
     */
    @tracked mode = 'visual';

    /**
     * Current query structure for visual mode
     *
     * @property queryStructure
     * @type Object
     * @tracked
     * @private
     */
    @tracked queryStructure = {
        condition: 'AND',
        rules: []
    };

    /**
     * Raw query string for text mode
     *
     * @property queryText
     * @type String
     * @tracked
     * @private
     */
    @tracked queryText = '';

    /**
     * Validation errors
     *
     * @property errors
     * @type Array
     * @tracked
     * @private
     */
    @tracked errors = [];

    /**
     * Whether the query is currently valid
     *
     * @property isValid
     * @type Boolean
     * @tracked
     * @private
     */
    @tracked isValid = true;

    /**
     * Constructor - initialize component state
     */
    constructor() {
        super(...arguments);
        this.initializeFromQuery();
    }

    /**
     * Initialize component state from the provided query
     *
     * @method initializeFromQuery
     * @private
     */
    initializeFromQuery() {
        if (this.args.query) {
            try {
                this.queryText = this.args.query;
                if (this.args.filters) {
                    this.queryStructure = queryParser.getRules(this.args.query, this.args.filters) || {
                        condition: 'AND',
                        rules: []
                    };
                }
            } catch (error) {
                console.warn('Failed to parse initial query:', error);
                this.errors = ['Invalid query format'];
                this.isValid = false;
            }
        }
    }

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

    /**
     * Switch between visual and text modes
     *
     * @method switchMode
     * @param {String} newMode
     * @action
     */
    @action
    switchMode(newMode) {
        if (newMode === this.mode) return;

        if (newMode === 'text') {
            // Convert visual structure to text
            try {
                this.queryText = this.generateQueryString();
            } catch (error) {
                console.warn('Failed to convert to text mode:', error);
            }
        } else if (newMode === 'visual') {
            // Convert text to visual structure
            try {
                if (this.queryText && this.args.filters) {
                    this.queryStructure = queryParser.getRules(this.queryText, this.args.filters) || {
                        condition: 'AND',
                        rules: []
                    };
                }
            } catch (error) {
                console.warn('Failed to convert to visual mode:', error);
                this.errors = ['Invalid query syntax'];
                this.isValid = false;
            }
        }

        this.mode = newMode;
    }

    /**
     * Add a new rule to the query
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

        this.queryStructure = {
            ...this.queryStructure,
            rules: [...this.queryStructure.rules, newRule]
        };

        this.updateQuery();
    }

    /**
     * Remove a rule from the query
     *
     * @method removeRule
     * @param {String} ruleId
     * @action
     */
    @action
    removeRule(ruleId) {
        this.queryStructure = {
            ...this.queryStructure,
            rules: this.queryStructure.rules.filter(rule => rule.id !== ruleId)
        };

        this.updateQuery();
    }

    /**
     * Update a rule in the query
     *
     * @method updateRule
     * @param {String} ruleId
     * @param {String} property
     * @param {*} value
     * @action
     */
    @action
    updateRule(ruleId, property, value) {
        this.queryStructure = {
            ...this.queryStructure,
            rules: this.queryStructure.rules.map(rule => {
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
            })
        };

        this.updateQuery();
    }

    /**
     * Update the condition (AND/OR) for the query group
     *
     * @method updateCondition
     * @param {String} condition
     * @action
     */
    @action
    updateCondition(condition) {
        this.queryStructure = {
            ...this.queryStructure,
            condition
        };

        this.updateQuery();
    }

    /**
     * Update query text (for text mode)
     *
     * @method updateQueryText
     * @param {Event} event
     * @action
     */
    @action
    updateQueryText(event) {
        this.queryText = event.target.value;
        this.validateQuery();
        
        // Debounce the query update
        clearTimeout(this._queryUpdateTimeout);
        this._queryUpdateTimeout = setTimeout(() => {
            this.updateQuery();
        }, 500);
    }

    /**
     * Validate the current query
     *
     * @method validateQuery
     * @private
     */
    validateQuery() {
        this.errors = [];
        this.isValid = true;

        if (this.mode === 'text' && this.queryText) {
            try {
                // Basic validation - check for balanced parentheses
                const openParens = (this.queryText.match(/\(/g) || []).length;
                const closeParens = (this.queryText.match(/\)/g) || []).length;
                
                if (openParens !== closeParens) {
                    this.errors.push('Unbalanced parentheses');
                    this.isValid = false;
                }

                // Try to parse the query
                if (this.args.filters) {
                    queryParser.getRules(this.queryText, this.args.filters);
                }
            } catch (error) {
                this.errors.push('Invalid query syntax');
                this.isValid = false;
            }
        }
    }

    /**
     * Generate query string from visual structure
     *
     * @method generateQueryString
     * @return {String}
     * @private
     */
    generateQueryString() {
        if (!this.queryStructure.rules.length) {
            return '';
        }

        return queryParser.getQueryString(this.queryStructure);
    }

    /**
     * Update the parent component with the current query
     *
     * @method updateQuery
     * @private
     */
    updateQuery() {
        let queryString = '';

        if (this.mode === 'visual') {
            queryString = this.generateQueryString();
        } else {
            queryString = this.queryText;
        }

        if (this.args.onChange) {
            this.args.onChange(queryString);
        }
    }

    /**
     * Clear the entire query
     *
     * @method clearQuery
     * @action
     */
    @action
    clearQuery() {
        this.queryStructure = {
            condition: 'AND',
            rules: []
        };
        this.queryText = '';
        this.errors = [];
        this.isValid = true;
        this.updateQuery();
    }

    /**
     * Add a new group to the query
     *
     * @method addGroup
     * @action
     */
    @action
    addGroup() {
        const newGroup = {
            id: `group_${Date.now()}`,
            condition: 'AND',
            rules: []
        };

        this.queryStructure = {
            ...this.queryStructure,
            rules: [...this.queryStructure.rules, newGroup]
        };

        this.updateQuery();
    }
}
