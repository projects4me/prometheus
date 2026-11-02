/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { CATEGORIES, CATEGORY_ICONS, NODE_DRAG_TYPE, kindsOf, kindLabelKey } from 'prometheus/utils/workflow/node-catalog';

/**
 * The node palette of the workflow editor: the kinds of each category, to drag onto the canvas or click to
 * add under the other nodes.
 *
 * @class WorkflowNodePaletteComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class WorkflowNodePaletteComponent extends Component {
    /**
     * The categories with their icon and kinds
     *
     * @property groups
     * @type Array
     * @public
     */
    get groups() {
        return CATEGORIES.map(category => ({
            category,
            icon: CATEGORY_ICONS[category],
            kinds: kindsOf(category).map(kind => ({ kind, labelKey: kindLabelKey(kind) }))
        }));
    }

    /**
     * Hands the dragged kind to the canvas
     *
     * @method startDrag
     * @param {String} category
     * @param {String} kind
     * @param {DragEvent} event
     * @public
     */
    @action startDrag(category, kind, event) {
        if (this.args.disabled) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.setData(NODE_DRAG_TYPE, JSON.stringify({ category, kind }));
        event.dataTransfer.effectAllowed = 'copy';
    }

    /**
     * @method add
     * @param {String} category
     * @param {String} kind
     * @param {Event} event
     * @public
     */
    @action add(category, kind, event) {
        event?.preventDefault();
        if (!this.args.disabled) {
            this.args.onAdd?.(category, kind);
        }
    }
}
