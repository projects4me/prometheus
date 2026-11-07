/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { parse } from 'prometheus/utils/query/parse';
import { serialize } from 'prometheus/utils/query/serializer';
import { compose } from 'prometheus/utils/query/composer';

/**
 * ezSearch: one query tree edited live by the search bar and the visual builder, with the list toolbar
 * around them.
 *
 * Arguments: `@schema`, `@query` (the Gaia string to load), `@baseQuery` (ANDed in on apply, never shown),
 * `@savedSearches` (`{id, name, query}`), `@onApply(queryString)`, `@onSave(queryString)` and `@aclContext`.
 * Optional: `@activeSavedSearchId` (the saved search to mark and, without `@query`, load) and
 * `@onSavedSearchChange(search|null)` (called when a saved search is picked, or deselected by picking it again,
 * by Clear, or by applying a query that no longer matches it).
 *
 * @class EzSearch
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class EzSearchComponent extends Component {
    @service intl;

    @tracked tree = null;
    @tracked builderOpen = false;
    @tracked barErrors = [];
    @tracked storedErrors = [];
    @tracked loadId = 0;
    @tracked pickedSearch = null;
    pickedQuery = '';
    loadCount = 0;

    constructor() {
        super(...arguments);
        this.load(this.args.query);
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
        this.pickedQuery = this.currentQuery;
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
        if (this.pickedSearch === search) {
            await this.deselect();

            return;
        }

        this.load(search.query);
        this.pickedSearch = search;
        this.pickedQuery = this.currentQuery;
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
     * Report the base query ANDed with the tree; nothing when serializing gives errors.
     *
     * @method apply
     */
    @action
    async apply() {
        if (this.hasErrors) {
            return;
        }

        let base = null;

        if (this.args.baseQuery) {
            let parsedBase = parse(this.args.baseQuery, this.args.schema);

            if (parsedBase.errors.length > 0) {
                return;
            }

            base = parsedBase.tree;
        }

        let { query, errors } = serialize(compose(base, this.tree));

        if (errors.length > 0) {
            return;
        }

        let appliedSearch = this.pickedSearch;
        let appliedTree = this.currentQuery;

        await this.args.onApply?.(query);

        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        if (appliedSearch && this.pickedSearch === appliedSearch && appliedTree !== this.pickedQuery) {
            this.pickedSearch = null;
            this.args.onSavedSearchChange?.(null);
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
}
