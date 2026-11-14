/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
/* global Messenger */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * An `<EzSearchCompact>` with the saved searches of a module: it lists them, saves the applied query under a name
 * (the save dialog) and replaces the query of a saved search. The saved-search service does the store calls; the
 * host owns the applied query and the active saved search.
 *
 * Arguments:
 * - `@schema`, `@query`, `@activeSavedSearchId`, `@aclContext`: passed to `<EzSearchCompact>`
 * - `@savedSearches`: the savedsearch records the route loaded
 * - `@relatedTo`: the module of the saved searches, e.g. `issue`
 * - `@projectId`: the project new saved searches belong to
 * - `@messages`: the translation namespace of the dialog and messages (default `views.app.issue.list.savedsearch`)
 * - `@onApply(query)`, `@onSavedSearchChange(item|null)`: the host's handlers
 *
 * @class SavedSearchCompactBar
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class SavedSearchCompactBarComponent extends Component {
    @service savedSearch;
    @service intl;
    @service errorManager;

    /**
     * The saved searches saved here since the host loaded `@savedSearches`.
     *
     * @property addedSearches
     * @type Array
     */
    @tracked addedSearches = [];

    /**
     * The unsaved record the open save dialog names; null while the dialog is closed.
     *
     * @property newSavedsearch
     * @type Object
     */
    @tracked newSavedsearch = null;

    /**
     * The query the save dialog shows.
     *
     * @property saveSearchQuery
     * @type String
     */
    @tracked saveSearchQuery = '';

    /**
     * The translation namespace of the dialog and messages.
     *
     * @property messages
     * @type String
     */
    get messages() {
        return this.args.messages ?? 'views.app.issue.list.savedsearch';
    }

    /**
     * The savedsearch records shown.
     *
     * @property records
     * @type Array
     */
    get records() {
        let loaded = this.args.savedSearches ?? [];
        return [...loaded, ...this.addedSearches.filter(record => !loaded.includes(record))];
    }

    /**
     * The saved searches in the shape `<EzSearchCompact>` expects; the record attributes are tracked, so an
     * update rebuilds them.
     *
     * @property items
     * @type Array
     */
    get items() {
        return this.records.map(search => ({
            id: search.get('id'),
            name: search.get('name'),
            query: search.get('searchquery')
        }));
    }

    /**
     * Opens the save dialog for the query ezSearch hands over.
     *
     * @method openSaveDialog
     * @param {String} query
     */
    @action
    openSaveDialog(query) {
        if (!query) {
            this.notify('error', this.intl.t(`${this.messages}.missing`));
            return;
        }
        this.saveSearchQuery = query;
        this.newSavedsearch = this.savedSearch.build();
    }

    /**
     * Closes the save dialog and drops the unsaved record.
     *
     * @method closeSaveDialog
     */
    @action
    closeSaveDialog() {
        if (this.newSavedsearch?.get('isNew')) {
            this.newSavedsearch.rollbackAttributes();
        }
        this.newSavedsearch = null;
    }

    /**
     * Saves the query of the dialog under the name entered.
     *
     * @method save
     * @returns {Promise}
     */
    @action
    async save() {
        let record = this.newSavedsearch;
        if (!record) {
            return false;
        }
        try {
            let data = await this.savedSearch.create(record, {
                relatedTo: this.args.relatedTo,
                query: this.saveSearchQuery,
                projectId: this.args.projectId
            });
            if (this.isDestroying || this.isDestroyed) {
                return false;
            }
            this.addedSearches = [...this.addedSearches, data];
            this.notify('success', this.intl.t(`${this.messages}.added`, { name: data.get('name'), htmlSafe: true }));
            // the modal hides itself on a truthy result and then calls closeSaveDialog
            return true;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
            // keep the dialog open so the user can retry
            return false;
        }
    }

    /**
     * Replaces the query of a saved search with the one ezSearch hands over.
     *
     * @method update
     * @param {Object} search The saved search item
     * @param {String} query
     * @returns {Promise}
     */
    @action
    async update(search, query) {
        let record = this.records.find(item => String(item.get('id')) === String(search.id));
        if (!record) {
            return;
        }
        try {
            await this.savedSearch.update(record, query);
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.notify('success', this.intl.t(`${this.messages}.updated`, { name: record.get('name'), htmlSafe: true }));
        } catch (error) {
            record.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
    }

    /**
     * Posts a message to the user.
     *
     * @method notify
     * @param {String} type
     * @param {String|Object} message
     * @private
     */
    notify(type, message) {
        new Messenger().post({ message, type, showCloseButton: true });
    }

    willDestroy() {
        super.willDestroy(...arguments);
        if (this.newSavedsearch?.get('isNew') && !this.newSavedsearch.isDestroyed) {
            this.newSavedsearch.rollbackAttributes();
        }
    }
}
