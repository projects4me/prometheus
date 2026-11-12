/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The activities of one thread for the Activity box: the newest few first, the rest on demand.
 *
 * @class ThreadActivities
 * @namespace Prometheus.Utils.State
 */
export default class ThreadActivities {
    /**
     * The loaded activities, newest first
     *
     * @property records
     * @type Array
     * @public
     */
    @tracked records = [];

    /**
     * Whether older activities exist that are not loaded
     *
     * @property hasMore
     * @type Boolean
     * @public
     */
    @tracked hasMore = false;

    roomId = null;
    showAll = false;

    /**
     * @constructor
     * @param {Object} options
     * @param {Object} options.store The Ember Data store
     * @param {Object} options.owner Owner whose destruction stops pending loads from writing state
     * @param {Number} options.limit How many activities show before "Show more"
     */
    constructor({ store, owner, limit = 5 } = {}) {
        this.store = store;
        this.owner = owner;
        this.limit = limit;
    }

    /**
     * Forgets the activities and loads the newest ones of the given thread
     *
     * @method open
     * @param {String} roomId
     * @returns {Promise}
     * @public
     */
    open(roomId) {
        this.roomId = roomId ?? null;
        this.showAll = false;
        this.records = [];
        this.hasMore = false;
        return this.load();
    }

    /**
     * Loads the activities again (the thread changed), keeping the extent the user chose
     *
     * @method reload
     * @returns {Promise}
     * @public
     */
    reload() {
        return this.load();
    }

    /**
     * Loads every activity of the thread
     *
     * @method loadAll
     * @returns {Promise}
     * @public
     */
    loadAll() {
        this.showAll = true;
        return this.load();
    }

    /**
     * @method load
     * @returns {Promise}
     * @private
     */
    async load() {
        let roomId = this.roomId;
        if (!roomId) return;
        try {
            // One row over the limit tells whether "Show more" is needed
            let result = await this.store.query('activity', {
                query: `(Activity.relatedTo : conversationroom) AND (Activity.relatedId : ${roomId})`,
                sort: 'Activity.dateCreated',
                order: 'DESC',
                limit: this.showAll ? -1 : this.limit + 1
            });
            if (this.roomId !== roomId || this.owner?.isDestroying || this.owner?.isDestroyed) return;
            let rows = result.slice();
            this.hasMore = !this.showAll && rows.length > this.limit;
            this.records = this.showAll ? rows : rows.slice(0, this.limit);
        } catch (error) {
            Logger.error('ThreadActivities::load - Error:', error);
        }
    }
}
