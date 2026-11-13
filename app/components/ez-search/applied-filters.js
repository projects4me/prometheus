/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isComplete, isCondition, isGroup, remove } from 'prometheus/utils/query/ast';
import { operator as findOperator } from 'prometheus/utils/query/operators';

/**
 * The conditions of a query tree as removable chips: one per complete top-level condition and one per
 * nested group. Incomplete conditions get no chip. Removing a chip emits the tree without its node;
 * the caller applies it.
 *
 * Arguments: `@tree`, `@schema` and `@onChange(tree)`.
 *
 * @class AppliedFilters
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchAppliedFiltersComponent extends Component {
    @service intl;

    /**
     * The chips of the root group: `{id, label, value, title}`.
     *
     * @property chips
     * @type Array
     */
    get chips() {
        let tree = this.args.tree;

        if (!isGroup(tree)) {
            return [];
        }

        return tree.children.map((node) => this.chipFor(node)).filter(Boolean);
    }

    chipFor(node) {
        let part = this.partFor(node);

        if (!part) {
            return null;
        }

        let title = part.value === '' ? part.label : `${part.label} ${part.value}`;

        return { id: node.id, label: part.label, value: part.value, title };
    }

    /**
     * The label and value text of a node, or null when it has nothing to show.
     *
     * @method partFor
     * @private
     */
    partFor(node) {
        if (isCondition(node)) {
            return isComplete(node) ? this.conditionPart(node) : null;
        }

        if (!isGroup(node)) {
            return null;
        }

        let parts = node.children.map((child) => this.partFor(child)).filter(Boolean);

        if (parts.length === 0) {
            return null;
        }

        let texts = parts.map((part) => this.textOf(part));
        let key = node.conjunction === 'OR' ? 'any' : 'all';

        return { label: this.intl.t(`components.ezSearch.chips.${key}`), value: texts.join(', '), isGroup: true };
    }

    textOf(part) {
        let text = part.value === '' ? part.label : `${part.label} ${part.value}`;

        return part.isGroup ? `(${text})` : text;
    }

    conditionPart(node) {
        let schema = this.args.schema;
        let field = (schema?.fields || []).find((entry) => entry.id === node.field);
        let name = field?.label || (field?.labelKey ? this.intl.t(field.labelKey) : node.field.slice(node.field.indexOf('.') + 1));
        let entry = findOperator(node.operator);
        let word = this.operatorWord(entry);
        let label = word ? `${name} ${word}` : name;

        if (entry.arity === 0) {
            return { label, value: '' };
        }

        let values = Array.isArray(node.value) ? node.value : [node.value];
        let display = values.map((value) => this.displayValue(field, value));
        let joiner = entry.arity === 2 ? ` ${this.intl.t('components.ezSearch.chips.and')} ` : ', ';

        return { label: `${label}:`, value: display.join(joiner) };
    }

    operatorWord(entry) {
        if (entry.key === ':') {
            return '';
        }

        let name = entry.labelKey.split('.').pop();

        return this.intl.t(`components.ezSearch.chips.operators.${name}`);
    }

    displayValue(field, value) {
        let options = field && this.args.schema?.valuesFor ? this.args.schema.valuesFor(field) : [];
        let match = (field?.values || options).find((option) => String(option.value) === String(value));

        return String(match ? match.label : value);
    }

    @action
    removeChip(id) {
        this.args.onChange?.(remove(this.args.tree, id));
    }
}
