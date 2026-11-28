/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The tags of one thread for the Tags box: the tag links loaded through the tags service.
 *
 * @class ThreadTags
 * @namespace Prometheus.Utils.State
 */
export default class ThreadTags {
    /**
     * The loaded tag links of the open thread, each with its tag
     *
     * @property records
     * @type Array<Tagged>
     * @public
     */
    @tracked records = [];

    roomId = null;
    projectId = null;

    /**
     * @constructor
     * @param {Object} options
     * @param {Object} options.tags The tags service
     * @param {Object} options.owner Owner whose destruction stops pending loads from writing state
     */
    constructor({ tags, owner } = {}) {
        this.tags = tags;
        this.owner = owner;
    }

    get isGone() {
        return this.owner?.isDestroying || this.owner?.isDestroyed;
    }

    /**
     * Forgets the tags and loads those of the given thread
     *
     * @method open
     * @param {String|null} roomId
     * @param {String|null} projectId
     * @returns {Promise}
     * @public
     */
    async open(roomId, projectId) {
        this.roomId = roomId ?? null;
        this.projectId = projectId ?? null;
        this.records = [];
        return this.reload();
    }

    /**
     * Refetches the tags of the open thread, keeping the shown ones until the new ones arrive
     *
     * @method reload
     * @returns {Promise}
     * @public
     */
    async reload() {
        if (!this.roomId) return;
        let roomIdAtStart = this.roomId;
        let records = await this.tags.forRecord('conversationroom', roomIdAtStart);
        if (this.isGone || this.roomId !== roomIdAtStart) return;
        this.records = records;
    }
}
