/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Sortable from 'sortablejs';
import { registerDestructor } from '@ember/destroyable';

/**
 * Makes the rows of a table body draggable by their handle and reports the
 * move. The DOM move made by SortableJS is undone so that the template, which
 * owns the list, re-renders the rows in their new order.
 *
 * @example
 *      <tbody {{sortable-rows handle=".drag-handle" onMove=this.moveRow}}>
 *
 * @class SortableRows
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class SortableRowsModifier extends Modifier {

    /**
     * The SortableJS instance attached to the element.
     *
     * @property sortable
     * @type Sortable
     * @private
     */
    sortable = null;

    /**
     * Destroys the SortableJS instance when the element is removed.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     * @public
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.sortable && this.sortable.destroy());
    }

    /**
     * Attaches SortableJS on first render.
     *
     * @method modify
     * @param {Element} element
     * @param {Array} positional
     * @param {Object} named `handle` is the drag handle selector, `onMove(oldIndex, newIndex)` receives the move
     * @public
     */
    modify(element, positional, named) {
        this.named = named;

        if (this.sortable) {
            return;
        }

        this.sortable = Sortable.create(element, {
            handle: named.handle,
            animation: 150,
            onEnd: (event) => this.finish(event)
        });
    }

    /**
     * Restores the row where it was and reports the move.
     *
     * @method finish
     * @param {Object} event The SortableJS end event
     * @private
     */
    finish({ item, from, oldIndex, newIndex }) {
        if (oldIndex === newIndex) {
            return;
        }

        from.removeChild(item);

        // A row that was last goes back before the markers Glimmer keeps after the rows, not after them.
        let last = from.lastElementChild;
        let next = from.children[oldIndex] || (last ? last.nextSibling : null);
        from.insertBefore(item, next);

        this.named.onMove(oldIndex, newIndex);
    }
}
