/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';

/**
 * The store calls for saved searches: load those of the current user for a module, create one and update
 * its query. Controllers and routes delegate here so the calls live in one place.
 *
 * @class SavedSearchService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class SavedSearchService extends Service {
    @service store;
    @service currentUser;

    /**
     * Load the saved searches of the current user for a module.
     *
     * @method load
     * @param {String} relatedTo The module, e.g. `issue`
     * @param {String|Number} [projectId] Limit to the searches of this project
     * @return {Promise<Array>} The savedsearch records
     */
    async load(relatedTo, projectId) {
        let query = `(Savedsearch.relatedTo : ${relatedTo})`;

        if (projectId !== undefined && projectId !== null) {
            query += ` AND (Savedsearch.projectId : ${projectId})`;
        }

        query += ` AND (Savedsearch.createdUser : ${this.currentUser.user.id})`;

        let result = await this.store.query('savedsearch', { query: `(${query})`, limit: -1 });

        return result.slice();
    }

    /**
     * Build an unsaved saved search record for a save dialog to name.
     *
     * @method build
     * @return {Object} The new savedsearch record
     */
    build() {
        return this.store.createRecord('savedsearch');
    }

    /**
     * Save a new saved search record.
     *
     * @method create
     * @param {Object} record An unsaved savedsearch record with its name set
     * @param {Object} options `relatedTo`, `query` and optionally `projectId`
     * @return {Promise<Object>} The saved record
     */
    create(record, { relatedTo, query, projectId }) {
        record.set('relatedTo', relatedTo);
        record.set('searchquery', query);

        if (projectId !== undefined) {
            record.set('projectId', projectId);
        }

        return record.save();
    }

    /**
     * Replace the query of a saved search.
     *
     * @method update
     * @param {Object} record The savedsearch record
     * @param {String} query The Gaia query string
     * @return {Promise<Object>} The saved record
     */
    update(record, query) {
        record.set('searchquery', query);

        return record.save();
    }
}
