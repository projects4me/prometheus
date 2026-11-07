/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { add, remove, setConjunction, condition, group } from 'prometheus/utils/query/ast';

/**
 * One group of the builder: the AND/OR switch, its conditions and nested groups. Edits go through the
 * `ast` helpers on `@tree` and come out as `@onChange(newTree)`.
 *
 * Arguments: `@group`, `@tree` (the root), `@schema`, `@errors`, `@isRoot` and `@onChange(tree)`.
 *
 * @class Group
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchGroupComponent extends Component {
    conjunctions = ['AND', 'OR'];

    emit(tree) {
        this.args.onChange?.(tree);
    }

    @action
    setConjunction(conjunction) {
        this.emit(setConjunction(this.args.tree, this.args.group.id, conjunction));
    }

    /**
     * Add an empty row: no field yet, so it stays out of the query until it is filled in.
     *
     * @method addCondition
     */
    @action
    addCondition() {
        this.emit(add(this.args.tree, this.args.group.id, condition('', '', null)));
    }

    @action
    addGroup() {
        this.emit(add(this.args.tree, this.args.group.id, group('AND', [])));
    }

    @action
    removeGroup() {
        this.emit(remove(this.args.tree, this.args.group.id));
    }
}
