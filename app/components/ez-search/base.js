/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { parse } from 'prometheus/utils/query/parse';
import { serialize } from 'prometheus/utils/query/serializer';
import { compose } from 'prometheus/utils/query/composer';

/**
 * The state and actions shared by every EzSearch layout (the toolbar, the compact variant). A layout extends
 * this class and supplies only its template, so layouts stay drop-in replacements of each other.
 *
 * It holds the tracked query tree (parsing `@query` and its errors), the saved-search selection, apply, clear
 * and save, and the builder open/closed state.
 *
 * Arguments:
 * - `@schema`: the field schema the query is parsed and edited against.
 * - `@query`: the Gaia query string to load; reloaded whenever it changes.
 * - `@baseQuery`: a Gaia query string ANDed in on apply, never shown.
 * - `@savedSearches`: the saved searches, `{id, name, query}`.
 * - `@activeSavedSearchId` (optional): the saved search to mark and, without `@query`, load.
 * - `@onApply(queryString)`: called with the composed query on apply; may return a promise.
 * - `@onSave(queryString)` (optional): called with the current query when the user saves it, also as a new
 *   search from the edited state; the Save as new entry shows only when it is given.
 * - `@onUpdateSavedSearch(search, queryString)` (optional): called when the user updates the active saved
 *   search with the edited query; the Update entry shows only when it is given.
 * - `@onSavedSearchChange(search|null)` (optional): called when a saved search is picked, or deselected by
 *   picking it again or by Clear. Editing the query keeps the search active (see `isEdited`).
 * - `@aclContext`: the ACL context passed to the apply button.
 *
 * @class EzSearchBase
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class EzSearchBase extends Component {
    @service intl;

    @tracked tree = null;
    @tracked builderOpen = false;
    @tracked barErrors = [];
    @tracked storedErrors = [];
    @tracked loadId = 0;
    @tracked pickedSearch = null;
    @tracked pickedQuery = '';
    loadCount = 0;
    appliedQuery = null;

    constructor() {
        super(...arguments);
        this.load(this.args.query);
        this.appliedQuery = this.composedQuery(parse(this.args.query || '', this.args.schema).tree);
        this.syncActive(!this.args.query);
    }

    /**
     * Mark the saved search named by `@activeSavedSearchId`, loading its query when asked to.
     *
     * @method syncActive
     * @param {Boolean} loadQuery
     */
    syncActive(loadQuery) {
        let id = this.args.activeSavedSearchId;

        if (id === undefined || id === null || id === '') {
            return;
        }

        let search = (this.args.savedSearches || []).find((item) => String(item.id) === String(id));

        if (!search) {
            this.pickedSearch = null;

            return;
        }

        if (loadQuery) {
            this.load(search.query);
        }

        this.pickedSearch = search;
        this.pickedQuery = this.savedForm(search);
    }

    /**
     * The serialized form of a saved search's query, what the tree is compared with to tell it was edited.
     *
     * @method savedForm
     * @param {Object} search
     * @return {String}
     */
    savedForm(search) {
        let { tree } = parse(search.query || '', this.args.schema);

        return tree ? serialize(tree).query : '';
    }

    @action
    onActiveChange() {
        let id = this.args.activeSavedSearchId;

        if (id === undefined || id === null || id === '') {
            this.pickedSearch = null;

            return;
        }

        if (this.pickedSearch && String(this.pickedSearch.id) === String(id)) {
            return;
        }

        this.syncActive(!this.args.query);
    }

    /**
     * Whether the bar holds text that does not read.
     *
     * @property hasErrors
     * @type Boolean
     */
    get hasErrors() {
        return this.barErrors.length > 0;
    }

    /**
     * Messages of a stored query that failed to parse.
     *
     * @property storedMessages
     * @type Array
     */
    get storedMessages() {
        return this.storedErrors.map((error) => this.intl.t(`components.ezSearch.errors.${error.code}`, error.params || {}));
    }

    /**
     * @property currentQuery
     * @type String
     */
    get currentQuery() {
        return this.tree ? serialize(this.tree).query : '';
    }

    /**
     * Whether the active saved search's query was changed: the serialized tree differs from the one loaded.
     *
     * @property isEdited
     * @type Boolean
     */
    get isEdited() {
        return Boolean(this.pickedSearch) && this.currentQuery !== this.pickedQuery;
    }

    /**
     * The saved searches with their active flag.
     *
     * @property searches
     * @type Array
     */
    get searches() {
        let current = this.currentQuery;

        return (this.args.savedSearches || []).map((search) => ({
            search,
            active: this.pickedSearch ? String(search.id) === String(this.pickedSearch.id) : current !== '' && search.query === current,
        }));
    }

    /**
     * Parse a Gaia query into the tree.
     *
     * @method load
     * @param {String} query
     */
    load(query) {
        let { tree, errors } = parse(query || '', this.args.schema);

        this.tree = tree;
        this.storedErrors = errors;
        this.barErrors = [];
        this.loadId = ++this.loadCount;
    }

    @action
    reload() {
        this.load(this.args.query);
        this.appliedQuery = this.composedQuery();
    }

    @action
    onTreeChange(tree) {
        this.tree = tree;
        this.storedErrors = [];
    }

    @action
    onBarErrors(errors) {
        this.barErrors = errors;
    }

    @action
    toggleBuilder() {
        this.builderOpen = !this.builderOpen;
    }

    @action
    async pickSaved(search) {
        if (this.pickedSearch && String(this.pickedSearch.id) === String(search.id)) {
            await this.deselect();

            return;
        }

        this.load(search.query);
        this.pickedSearch = search;
        this.pickedQuery = this.savedForm(search);
        this.args.onSavedSearchChange?.(search);
        await this.apply();
    }

    /**
     * Drop the mark and the tree, report it and apply.
     *
     * @method deselect
     */
    async deselect() {
        this.load('');
        this.pickedSearch = null;
        this.args.onSavedSearchChange?.(null);
        await this.apply();
    }

    /**
     * The base query ANDed with the tree, formatted; null when the base or the tree gives errors.
     *
     * @method composedQuery
     * @param {Object|null} tree The tree to compose, the current one by default
     * @return {String|null}
     */
    composedQuery(tree = this.tree) {
        let base = null;

        if (this.args.baseQuery) {
            let parsedBase = parse(this.args.baseQuery, this.args.schema);

            if (parsedBase.errors.length > 0) {
                return null;
            }

            base = parsedBase.tree;
        }

        let { query, errors } = serialize(compose(base, tree));

        return errors.length > 0 ? null : query;
    }

    /**
     * Report the base query ANDed with the tree; nothing when serializing gives errors, or when the
     * query equals the one last applied (so an empty bar with nothing applied does nothing).
     *
     * @method apply
     */
    @action
    async apply() {
        if (this.hasErrors) {
            return;
        }

        let query = this.composedQuery();

        if (query === null || query === this.appliedQuery) {
            return;
        }

        let previous = this.appliedQuery;

        this.appliedQuery = query;

        try {
            await this.args.onApply?.(query);
        } catch (error) {
            this.appliedQuery = previous;
            throw error;
        }
    }

    /**
     * Empty the tree and apply.
     *
     * @method clear
     */
    @action
    async clear() {
        this.load('');
        this.pickedSearch = null;
        this.args.onSavedSearchChange?.(null);
        await this.apply();
    }

    @action
    save() {
        this.args.onSave?.(this.currentQuery);
    }

    /**
     * Hand the edited query to `@onUpdateSavedSearch`, make it the saved version and apply it.
     *
     * @method updateSaved
     */
    @action
    async updateSaved() {
        let search = this.pickedSearch;
        let query = this.currentQuery;

        if (!search || this.hasErrors || query === '') {
            return;
        }

        await this.args.onUpdateSavedSearch?.(search, query);

        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        let fresh = (this.args.savedSearches || []).find((item) => String(item.id) === String(search.id));

        this.pickedSearch = fresh || search;
        this.pickedQuery = query;
        await this.apply();
    }

    /**
     * Load the active saved search's query back and apply it.
     *
     * @method revert
     */
    @action
    async revert() {
        if (!this.pickedSearch) {
            return;
        }

        this.load(this.pickedSearch.query);
        this.pickedQuery = this.savedForm(this.pickedSearch);
        await this.apply();
    }
}
