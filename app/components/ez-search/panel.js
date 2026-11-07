/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { group, isGroup } from 'prometheus/utils/query/ast';
import { serialize } from 'prometheus/utils/query/serializer';

/**
 * The visual builder of ezSearch: the root group of a query tree. It never changes `@tree`; every edit
 * is reported as `@onChange(newTree)`.
 *
 * Arguments: `@tree` (an `ast` group, or empty), `@schema` and `@onChange(tree)`.
 *
 * @class Panel
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchPanelComponent extends Component {
    emptyRoot = group('AND', []);

    /**
     * The root group; an empty tree shows one empty AND group.
     *
     * @property root
     * @type Object
     */
    get root() {
        return isGroup(this.args.tree) ? this.args.tree : this.emptyRoot;
    }

    /**
     * The serializer's refusals of the tree, each with the `nodeId` of its condition.
     *
     * @property errors
     * @type Array
     */
    get errors() {
        return serialize(this.root).errors;
    }

    /**
     * @method update
     * @param {Object} tree The edited tree
     */
    @action
    update(tree) {
        this.args.onChange?.(tree);
    }
}
