/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import EzSearchBase from '../ez-search/base';
import { isComplete, isCondition, isGroup } from 'prometheus/utils/query/ast';
import config from 'prometheus/config/environment';
import { serialize } from 'prometheus/utils/query/serializer';

/**
 * A compact ezSearch for narrow places, a drop-in replacement for
 * {{#crossLink "Prometheus.Components.EzSearch"}}{{/crossLink}}: it takes the same arguments (see
 * {{#crossLink "Prometheus.Components.EzSearchBase"}}{{/crossLink}}) and only changes the layout. The visual
 * builder opens in a modal that edits a draft of the tree: Search applies it, Cancel drops it.
 *
 * Extra argument: `@linear`, one row (Saved icon, bar, Filter, Search, Clear) and no applied-filter chips,
 * instead of the default three rows.
 *
 * @class EzSearchCompact
 * @namespace Prometheus.Components
 * @extends EzSearchBase
 */
export default class EzSearchCompactComponent extends EzSearchBase {
    /**
     * The tree being edited in the filter modal; null while the modal is closed.
     *
     * @property draft
     * @type Object
     */
    @tracked draft = null;

    /**
     * Whether the filter modal is open.
     *
     * @property filterOpen
     * @type Boolean
     */
    @tracked filterOpen = false;

    /**
     * The number of complete conditions in the applied tree, at any depth.
     *
     * @property conditionCount
     * @type Number
     */
    get conditionCount() {
        let count = (node) => {
            if (isCondition(node)) {
                return isComplete(node) ? 1 : 0;
            }

            return isGroup(node) ? node.children.reduce((sum, child) => sum + count(child), 0) : 0;
        };

        return count(this.tree);
    }

    /**
     * The exact Gaia format of the draft, shown in the modal.
     *
     * @property draftQuery
     * @type String
     */
    get draftQuery() {
        return this.draft ? serialize(this.draft).query : '';
    }

    /**
     * Where the modal is rendered: the app root, outside the page's containers, so no stacking context of the page (a board filter bar, say)
     * can trap it under Bootstrap's backdrop.
     *
     * @property modalRoot
     * @type HTMLElement
     * @private
     */
    get modalRoot() {
        return document.querySelector(config.APP.rootElement || 'body') || document.body;
    }

    @action
    openFilter() {
        this.draft = this.tree;
        this.filterOpen = true;
    }

    @action
    onDraftChange(tree) {
        this.draft = tree;
    }

    /**
     * Take the draft as the query and apply it; the modal closes.
     *
     * @method searchFilter
     * @return {Boolean}
     */
    @action
    searchFilter() {
        this.onTreeChange(this.draft);
        this.apply();

        return true;
    }

    /**
     * Clear the query and apply it; the modal closes.
     *
     * @method clearFilter
     */
    @action
    clearFilter() {
        this.clear();
    }

    /**
     * Forget the draft once the modal is hidden, however it was dismissed.
     *
     * @method closeFilter
     */
    @action
    closeFilter() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        this.filterOpen = false;
        this.draft = null;
    }

    /**
     * A chip was removed: take the new tree and apply it at once.
     *
     * @method removeChip
     * @param {Object} tree
     */
    @action
    async removeChip(tree) {
        this.onTreeChange(tree);
        await this.apply();
    }
}
