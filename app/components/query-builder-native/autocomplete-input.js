/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Custom autocomplete input component for query text editing.
 * Provides intelligent suggestions based on cursor position and context.
 *
 * @class AutocompleteInput
 * @namespace Prometheus.Components.QueryBuilderNative
 * @extends Glimmer.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AutocompleteInputComponent extends Component {

    /**
     * The intl service for translations
     *
     * @property intl
     * @type Service
     * @private
     */
    @service intl;

    /**
     * Current suggestions to display
     *
     * @property suggestions
     * @type Array
     * @tracked
     * @private
     */
    @tracked suggestions = [];

    /**
     * Whether suggestions dropdown is visible
     *
     * @property showSuggestions
     * @type Boolean
     * @tracked
     * @private
     */
    @tracked showSuggestions = false;

    /**
     * Currently selected suggestion index
     *
     * @property selectedIndex
     * @type Number
     * @tracked
     * @private
     */
    @tracked selectedIndex = -1;

    /**
     * Current cursor position in the textarea
     *
     * @property cursorPosition
     * @type Number
     * @tracked
     * @private
     */
    @tracked cursorPosition = 0;

    /**
     * Reference to the textarea element
     *
     * @property textareaElement
     * @type HTMLElement
     * @private
     */
    textareaElement = null;

    /**
     * Available operators for suggestions
     *
     * @property operators
     * @type Array
     * @readonly
     */
    get operators() {
        return [
            { value: ':', label: this.intl.t('views.components.queryBuilder.operators.equals') },
            { value: '!:', label: this.intl.t('views.components.queryBuilder.operators.notEquals') },
            { value: '<', label: this.intl.t('views.components.queryBuilder.operators.lessThan') },
            { value: '>', label: this.intl.t('views.components.queryBuilder.operators.greaterThan') },
            { value: '<:', label: this.intl.t('views.components.queryBuilder.operators.lessThanOrEquals') },
            { value: '>:', label: this.intl.t('views.components.queryBuilder.operators.greaterThanOrEquals') },
            { value: 'CONTAINS', label: this.intl.t('views.components.queryBuilder.operators.contains') },
            { value: '!CONTAINS', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.contains') },
            { value: 'STARTS', label: this.intl.t('views.components.queryBuilder.operators.starts') },
            { value: '!STARTS', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.starts') },
            { value: 'ENDS', label: this.intl.t('views.components.queryBuilder.operators.ends') },
            { value: '!ENDS', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.ends') },
            { value: 'BETWEEN', label: this.intl.t('views.components.queryBuilder.operators.between') },
            { value: '!BETWEEN', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.between') },
            { value: 'NULL', label: this.intl.t('views.components.queryBuilder.operators.null') },
            { value: '!NULL', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.null') },
            { value: 'EMPTY', label: this.intl.t('views.components.queryBuilder.operators.empty') },
            { value: '!EMPTY', label: 'Not ' + this.intl.t('views.components.queryBuilder.operators.empty') }
        ];
    }

    /**
     * Available logical operators
     *
     * @property logicalOperators
     * @type Array
     * @readonly
     */
    get logicalOperators() {
        return ['AND', 'OR'];
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
     * Handle textarea input and update suggestions
     *
     * @method handleInput
     * @param {Event} event
     * @action
     */
    @action
    handleInput(event) {
        const value = event.target.value;
        this.cursorPosition = event.target.selectionStart;
        
        // Call parent onChange
        if (this.args.onChange) {
            this.args.onChange(event);
        }

        // Update suggestions based on current context
        this.updateSuggestions(value, this.cursorPosition);
    }

    /**
     * Handle keyboard navigation in suggestions
     *
     * @method handleKeyDown
     * @param {Event} event
     * @action
     */
    @action
    handleKeyDown(event) {
        if (!this.showSuggestions || !this.suggestions.length) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                break;
            case 'Enter':
            case 'Tab':
                if (this.selectedIndex >= 0) {
                    event.preventDefault();
                    this.insertSuggestion(this.suggestions[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    /**
     * Handle textarea focus
     *
     * @method handleFocus
     * @param {Event} event
     * @action
     */
    @action
    handleFocus(event) {
        this.textareaElement = event.target;
        this.cursorPosition = event.target.selectionStart;
        this.updateSuggestions(event.target.value, this.cursorPosition);
    }

    /**
     * Handle textarea blur (with delay to allow clicking suggestions)
     *
     * @method handleBlur
     * @action
     */
    @action
    handleBlur() {
        // Delay hiding suggestions to allow clicking on them
        setTimeout(() => {
            this.hideSuggestions();
        }, 200);
    }

    /**
     * Update suggestions based on current text and cursor position
     *
     * @method updateSuggestions
     * @param {String} text
     * @param {Number} cursorPos
     * @private
     */
    updateSuggestions(text, cursorPos) {
        const context = this.parseContext(text, cursorPos);
        const suggestions = this.getSuggestionsForContext(context);
        
        this.suggestions = suggestions;
        this.showSuggestions = suggestions.length > 0;
        this.selectedIndex = -1;
    }

    /**
     * Parse the context around the cursor position
     *
     * @method parseContext
     * @param {String} text
     * @param {Number} cursorPos
     * @return {Object}
     * @private
     */
    parseContext(text, cursorPos) {
        const beforeCursor = text.substring(0, cursorPos);
        const afterCursor = text.substring(cursorPos);
        
        // Find the current word/token
        const wordMatch = beforeCursor.match(/(\w+\.?\w*|\S+)$/);
        const currentWord = wordMatch ? wordMatch[1] : '';
        
        // Determine context type
        let contextType = 'field';
        
        // Check if we're inside parentheses
        const openParens = (beforeCursor.match(/\(/g) || []).length;
        const closeParens = (beforeCursor.match(/\)/g) || []).length;
        const insideParens = openParens > closeParens;
        
        if (!insideParens) {
            contextType = 'logical';
        } else {
            // Check if we have a field already
            const fieldMatch = beforeCursor.match(/\(\s*(\w+\.\w+)/);
            if (fieldMatch) {
                // Check if we have an operator
                const operatorMatch = beforeCursor.match(/\(\s*\w+\.\w+\s+(\w+|[<>:!]+)/);
                if (operatorMatch) {
                    contextType = 'value';
                } else {
                    contextType = 'operator';
                }
            }
        }

        return {
            type: contextType,
            currentWord,
            beforeCursor,
            afterCursor,
            insideParens
        };
    }

    /**
     * Get suggestions based on context
     *
     * @method getSuggestionsForContext
     * @param {Object} context
     * @return {Array}
     * @private
     */
    getSuggestionsForContext(context) {
        const { type, currentWord } = context;
        let suggestions = [];

        switch (type) {
            case 'field':
                suggestions = this.availableFields
                    .filter(field => field.id.toLowerCase().includes(currentWord.toLowerCase()))
                    .map(field => ({
                        value: field.id,
                        label: field.label,
                        type: 'field'
                    }));
                break;
                
            case 'operator':
                suggestions = this.operators
                    .filter(op => op.value.toLowerCase().includes(currentWord.toLowerCase()))
                    .map(op => ({
                        value: op.value,
                        label: op.label,
                        type: 'operator'
                    }));
                break;
                
            case 'logical':
                suggestions = this.logicalOperators
                    .filter(op => op.toLowerCase().includes(currentWord.toLowerCase()))
                    .map(op => ({
                        value: op,
                        label: op,
                        type: 'logical'
                    }));
                break;
                
            case 'value':
                // For values, we could suggest based on field type
                // For now, just provide some common patterns
                suggestions = [
                    { value: "'text'", label: this.intl.t('views.components.queryBuilder.autocomplete.suggestions.textValue'), type: 'value' },
                    { value: "NULL", label: this.intl.t('views.components.queryBuilder.autocomplete.suggestions.nullValue'), type: 'value' }
                ];
                break;
        }

        return suggestions.slice(0, 10); // Limit to 10 suggestions
    }

    /**
     * Insert a suggestion at the current cursor position
     *
     * @method insertSuggestion
     * @param {Object} suggestion
     * @action
     */
    @action
    insertSuggestion(suggestion) {
        if (!this.textareaElement) return;

        const text = this.textareaElement.value;
        const cursorPos = this.cursorPosition;
        
        // Find the word to replace
        const beforeCursor = text.substring(0, cursorPos);
        const afterCursor = text.substring(cursorPos);
        const wordMatch = beforeCursor.match(/(\w+\.?\w*|\S+)$/);
        
        let newText;
        let newCursorPos;
        
        if (wordMatch) {
            // Replace the current word
            const wordStart = cursorPos - wordMatch[1].length;
            newText = text.substring(0, wordStart) + suggestion.value + afterCursor;
            newCursorPos = wordStart + suggestion.value.length;
        } else {
            // Insert at cursor position
            newText = beforeCursor + suggestion.value + afterCursor;
            newCursorPos = cursorPos + suggestion.value.length;
        }

        // Update textarea value
        this.textareaElement.value = newText;
        this.textareaElement.setSelectionRange(newCursorPos, newCursorPos);
        
        // Trigger change event
        const changeEvent = new Event('input', { bubbles: true });
        this.textareaElement.dispatchEvent(changeEvent);
        
        this.hideSuggestions();
        this.textareaElement.focus();
    }

    /**
     * Hide suggestions dropdown
     *
     * @method hideSuggestions
     * @private
     */
    hideSuggestions() {
        this.showSuggestions = false;
        this.selectedIndex = -1;
    }

    /**
     * Handle clicking on a suggestion
     *
     * @method selectSuggestion
     * @param {Object} suggestion
     * @action
     */
    @action
    selectSuggestion(suggestion) {
        this.insertSuggestion(suggestion);
    }
}
