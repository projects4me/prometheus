/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { parse } from 'prometheus/utils/query/parse';
import { serialize } from 'prometheus/utils/query/serializer';
import { complete } from 'prometheus/utils/query/completer';

/**
 * The text editor of ezSearch. The user types a loose query; on Enter or blur it is parsed against
 * `@schema` and, when it reads, reported with `@onChange(tree)` and replaced by the exact Gaia format.
 * Errors are shown under the input and nothing is reported. A suggestion menu from `complete()` helps
 * while typing.
 *
 * Arguments: `@tree`, `@schema`, `@placeholder`, `@onChange(tree)`, `@onErrors(errors)` and `@onRun()`.
 *
 * @class SearchBar
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchSearchBarComponent extends Component {
    @service intl;

    @tracked draft = null;
    @tracked focused = false;
    @tracked menuOpen = false;
    @tracked activeIndex = 0;
    @tracked cursor = 0;
    @tracked errors = [];

    /**
     * Keep the parse errors of the text and report them with `@onErrors(errors)`.
     *
     * @method setErrors
     * @param {Array} errors
     */
    setErrors(errors) {
        this.errors = errors;
        this.args.onErrors?.(errors);
    }

    /**
     * The text of the input: the draft while editing, else the exact format of `@tree`.
     *
     * @property text
     * @type String
     */
    get text() {
        if (this.draft !== null) {
            return this.draft;
        }

        return this.args.tree ? serialize(this.args.tree).query : '';
    }

    get completion() {
        return complete(this.text, this.cursor, this.args.schema);
    }

    /**
     * The suggestions as menu items, with a section header before the first of each kind.
     *
     * @property items
     * @type Array
     */
    get items() {
        let seen = new Set();

        return this.completion.suggestions.map((suggestion, index) => {
            let first = !seen.has(suggestion.kind);

            seen.add(suggestion.kind);

            return {
                suggestion,
                header: first ? this.intl.t(`components.ezSearch.searchBar.sections.${suggestion.kind}`) : null,
                label: this.labelOf(suggestion),
                active: index === this.activeIndex,
            };
        });
    }

    get showMenu() {
        return this.menuOpen && this.items.length > 0;
    }

    get showQueryText() {
        return !this.focused && this.draft === null && this.text !== '';
    }

    get messages() {
        return this.errors.map((error) => ({
            text: this.intl.t(`components.ezSearch.errors.${error.code}`, error.params || {}),
            position: error.start + 1,
        }));
    }

    labelOf(suggestion) {
        if (suggestion.label.startsWith('components.')) {
            return this.intl.t(suggestion.label, suggestion.params || {});
        }

        return suggestion.label;
    }

    /**
     * Parse the draft. A query that reads is reported and its exact format shown; errors stay visible.
     *
     * @method commit
     * @return {Boolean} Whether the text parsed
     */
    commit() {
        if (this.draft === null) {
            return true;
        }

        let { tree, errors } = parse(this.draft, this.args.schema);

        this.setErrors(errors);

        if (errors.length > 0) {
            return false;
        }

        this.draft = null;
        this.args.onChange?.(tree);

        return true;
    }

    syncCursor(event) {
        let cursor = event.target.selectionStart ?? this.text.length;

        if (cursor !== this.cursor) {
            this.cursor = cursor;
            this.activeIndex = 0;
        }
    }

    @action
    onInput(event) {
        this.draft = event.target.value;
        this.syncCursor(event);
        this.setErrors([]);
        this.activeIndex = 0;
        this.menuOpen = true;
    }

    @action
    onFocus(event) {
        this.focused = true;
        this.syncCursor(event);
        this.menuOpen = true;
    }

    @action
    onBlur() {
        this.focused = false;
        this.menuOpen = false;
        this.commit();
    }

    @action
    onCaret(event) {
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
            return;
        }
        this.syncCursor(event);
    }

    @action
    onKeydown(event) {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        let count = this.items.length;

        if (this.showMenu && event.key === 'ArrowDown') {
            event.preventDefault();
            this.activeIndex = (this.activeIndex + 1) % count;
        } else if (this.showMenu && event.key === 'ArrowUp') {
            event.preventDefault();
            this.activeIndex = (this.activeIndex - 1 + count) % count;
        } else if (this.showMenu && (event.key === 'Tab' || (event.key === 'Enter' && this.draft !== null))) {
            event.preventDefault();
            this.accept(this.completion.suggestions[this.activeIndex], event.target);
        } else if (event.key === 'Escape' && this.menuOpen) {
            event.preventDefault();
            this.menuOpen = false;
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (this.commit()) {
                this.args.onRun?.();
            }
        }
    }

    accept(suggestion, input) {
        let { replaceStart, replaceEnd } = this.completion;
        let text = this.text;
        let needsSpace = suggestion.kind !== 'bracket' && !text.slice(replaceEnd).startsWith(' ');
        let inserted = suggestion.insert + (needsSpace ? ' ' : '');

        this.draft = text.slice(0, replaceStart) + inserted + text.slice(replaceEnd);
        this.cursor = replaceStart + inserted.length;
        this.activeIndex = 0;
        this.setErrors([]);

        if (input) {
            let position = this.cursor;

            input.value = this.draft;
            input.setSelectionRange?.(position, position);
        }
    }

    @action
    pick(suggestion, event) {
        // mousedown keeps the focus in the input
        event.preventDefault();
        this.accept(suggestion, event.currentTarget.closest('.ez-search-bar').querySelector('input'));
    }

    @action
    clickItem(suggestion, event) {
        event.preventDefault();

        // a click without a preceding mousedown (assistive technology) has no pointer detail
        if (event.detail === 0) {
            this.pick(suggestion, event);
        }
    }

    @action
    focusInput(event) {
        event.currentTarget.parentElement?.querySelector('input')?.focus();
    }
}
