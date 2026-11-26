/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The tags of one thread for the Tags box: the tag links loaded through the tags service, with add and remove.
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
        if (!this.roomId) return;
        let roomIdAtStart = this.roomId;
        let records = await this.tags.forRecord('conversationroom', roomIdAtStart);
        if (this.isGone || this.roomId !== roomIdAtStart) return;
        this.records = records;
    }

    /**
     * The tags service's project suggestions for the text, without the tags the thread already has
     *
     * @method suggest
     * @param {String} text
     * @returns {Promise<Array<{label: String}>>}
     * @public
     */
    async suggest(text) {
        let found = await this.tags.suggest(this.projectId, text);
        let taken = new Set(this.records.map((tagged) => this.nameOf(tagged).toLowerCase()));
        return found.map((tag) => ({ label: String(tag.tag) })).filter((option) => !taken.has(option.label.toLowerCase()));
    }

    /**
     * Tags the thread with the text (an existing tag is reused). Text the thread already has is ignored.
     *
     * @method add
     * @param {String} text
     * @returns {Promise}
     * @public
     */
    async add(text) {
        let name = String(text ?? '').trim();
        if (!name || !this.roomId) return;
        if (this.records.some((tagged) => this.nameOf(tagged).toLowerCase() === name.toLowerCase())) return;
        let roomId = this.roomId;
        let tagged = await this.tags.attach(this.projectId, 'conversationroom', roomId, name);
        if (this.isGone || this.roomId !== roomId) return;
        this.records = [...this.records, tagged];
    }

    /**
     * Removes the tag from the thread
     *
     * @method remove
     * @param {Tagged} tagged
     * @returns {Promise}
     * @public
     */
    async remove(tagged) {
        await this.tags.detach(tagged);
        if (this.isGone) return;
        this.records = this.records.filter((record) => record !== tagged);
    }

    nameOf(tagged) {
        return String(tagged.tag?.get?.('tag') ?? tagged.tag?.tag ?? '').trim();
    }
}
