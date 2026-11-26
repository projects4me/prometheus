import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import FormFieldsComponent from "./form-fields";

/**
 * Several related records in one select.
 *
 * With the optional `@onCreate(text)` argument the list gets a first option `Add "text"` whenever the typed
 * text matches no option (case-insensitive). Choosing it, or pressing Enter while it is highlighted, calls
 * `@onCreate` with the trimmed text instead of `@onchange`. Without `@onCreate` the field is unchanged.
 *
 * @class FormFieldsFieldRelateMultiComponent
 * @namespace Prometheus.Components
 * @extends FormFieldsComponent
 */
export default class FormFieldsFieldRelateMultiComponent extends FormFieldsComponent {

    /**
     * The text typed in the search box
     *
     * @property searchText
     * @type String
     * @public
     */
    @tracked searchText = '';

    get canCreate() {
        return typeof this.args.onCreate === 'function';
    }

    get createText() {
        return this.searchText.trim();
    }

    get labelField() {
        return this.args.searchField || 'label';
    }

    /**
     * Whether the typed text is new: not empty and equal to no option's label
     *
     * @property showCreate
     * @type Boolean
     * @public
     */
    get showCreate() {
        if (!this.canCreate || !this.createText) {
            return false;
        }
        return !this.hasExactMatch(this.args.options ?? []);
    }

    get createOption() {
        return { __create: true, text: this.createText };
    }

    /**
     * The options handed to the select: the caller's, with the "Add" option first when the text is new
     *
     * @property options
     * @type Array
     * @public
     */
    get options() {
        let options = this.args.options;
        return this.showCreate && !this.args.search ? [this.createOption, ...(options ?? [])] : options;
    }

    /**
     * The search handed to the select: the caller's, wrapped so the "Add" option comes first
     *
     * @property search
     * @type Function|undefined
     * @public
     */
    get search() {
        if (!this.canCreate || !this.args.search) {
            return this.args.search;
        }
        return async (term) => {
            let found = await this.args.search(term);
            let text = (term ?? '').trim();
            let list = found?.toArray ? found.toArray() : [...(found ?? [])];
            return text && !this.hasExactMatch(list) ? [{ __create: true, text }, ...list] : list;
        };
    }

    /**
     * The matcher handed to the select: the caller's, but the "Add" option always matches
     *
     * @property matcher
     * @type Function|undefined
     * @public
     */
    get matcher() {
        if (!this.canCreate) {
            return this.args.matcher;
        }
        return (option, term) => {
            if (option?.__create) {
                return 0;
            }
            if (this.args.matcher) {
                return this.args.matcher(option, term);
            }
            let label = String(option?.[this.labelField] ?? '').toLowerCase();
            return label.indexOf((term ?? '').toLowerCase());
        };
    }

    hasExactMatch(options) {
        let text = this.createText.toLowerCase();
        return Array.from(options).some((option) => {
            let label = typeof option === 'string' ? option : option?.[this.labelField] ?? option?.label;
            return String(label ?? '').trim().toLowerCase() === text;
        });
    }

    @action
    handleInput(text) {
        this.searchText = text ?? '';
    }

    /**
     * Calls `@onCreate` when the "Add" option was chosen, `@onchange` otherwise
     *
     * @method handleChange
     * @param {Array} selected
     * @param {Object} select power-select's public API
     * @param {Event} event
     * @public
     */
    @action
    handleChange(selected, select, event) {
        let created = Array.from(selected ?? []).find((option) => option?.__create);
        if (!created) {
            return this.args.onchange?.(selected, select, event);
        }
        this.searchText = '';
        select?.actions?.search?.('');
        select?.actions?.close?.();
        this.args.onCreate(created.text);
    }
}
