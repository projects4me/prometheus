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
 * `@savedSearches` (`{name, query}`), `@onApply(queryString)`, `@onSave(queryString)` and `@aclContext`.
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
    loadCount = 0;

    constructor() {
        super(...arguments);
        this.load(this.args.query);
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
            active: current !== '' && search.query === current,
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
    pickSaved(search) {
        this.load(search.query);
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

        await this.args.onApply?.(query);
    }

    /**
     * Empty the tree and apply.
     *
     * @method clear
     */
    @action
    async clear() {
        this.load('');
        await this.apply();
    }

    @action
    save() {
        this.args.onSave?.(this.currentQuery);
    }
}
