/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { operator as findOperator } from 'prometheus/utils/query/operators';

/**
 * The ezSearch query tree. A query is one tree of groups and conditions:
 *
 *     { kind: 'group', id, conjunction: 'AND' | 'OR', children: [...] }
 *     { kind: 'condition', id, field, operator, value }
 *
 * `operator` is an operator key from `utils/query/operators`. `value` is a string, an array for IN and
 * NOT IN, `[from, to]` for BETWEEN, or null for the nullary operators.
 *
 * Nodes are plain frozen objects. Every helper returns a new tree and leaves its input alone; nodes
 * that do not change are shared between the old and the new tree.
 *
 * @class Ast
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * The conjunctions a group can have.
 *
 * @property CONJUNCTIONS
 * @type Array
 * @final
 */
export const CONJUNCTIONS = Object.freeze(['AND', 'OR']);

let lastId = 0;

/**
 * A new id that is unique in this session, used as the UI key of a node.
 *
 * @method nextId
 * @return {String}
 * @private
 */
function nextId() {
    lastId += 1;
    return `ez${lastId}`;
}

/**
 * Create a group.
 *
 * @method group
 * @param {String} conjunction 'AND' or 'OR'; anything else is read as 'AND'
 * @param {Array} children The child nodes
 * @param {String} [id] Keep this id instead of creating one
 * @return {Object} The group node
 */
export function group(conjunction = 'AND', children = [], id = nextId()) {
    let upper = String(conjunction).toUpperCase();

    return Object.freeze({
        kind: 'group',
        id,
        conjunction: CONJUNCTIONS.includes(upper) ? upper : 'AND',
        children: Object.freeze([...children]),
    });
}

/**
 * Create a condition.
 *
 * @method condition
 * @param {String} field The field id, e.g. `Issue.priority`
 * @param {String} operator The operator key, e.g. `:` or `IN`
 * @param {String|Array|null} value The value
 * @param {String} [id] Keep this id instead of creating one
 * @return {Object} The condition node
 */
export function condition(field, operator, value = null, id = nextId()) {
    return Object.freeze({
        kind: 'condition',
        id,
        field,
        operator,
        value: Array.isArray(value) ? Object.freeze([...value]) : value,
    });
}

/**
 * @method isGroup
 * @param {Object} node
 * @return {Boolean}
 */
export function isGroup(node) {
    return Boolean(node) && node.kind === 'group';
}

/**
 * @method isCondition
 * @param {Object} node
 * @return {Boolean}
 */
export function isCondition(node) {
    return Boolean(node) && node.kind === 'condition';
}

/**
 * Whether a single value is filled in.
 *
 * @method isFilled
 * @param {*} value
 * @return {Boolean}
 * @private
 */
function isFilled(value) {
    return (typeof value === 'string' && value.trim() !== '') || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * Whether a condition has a field, a known operator and the value its operator's arity needs.
 *
 * @method isComplete
 * @param {Object} node The condition
 * @return {Boolean}
 */
export function isComplete(node) {
    if (!isCondition(node) || typeof node.field !== 'string' || node.field.trim() === '') {
        return false;
    }

    let entry = findOperator(node.operator);

    if (!entry) {
        return false;
    }

    let { value } = node;

    switch (entry.arity) {
        case 0:
            return true;
        case 1:
            return isFilled(value);
        case 2:
            return Array.isArray(value) && value.length === 2 && value.every(isFilled);
        default:
            return Array.isArray(value) && value.length > 0 && value.every(isFilled);
    }
}

/**
 * Find a node by id.
 *
 * @method find
 * @param {Object} tree
 * @param {String} id
 * @return {Object|null}
 */
export function find(tree, id) {
    if (!tree) {
        return null;
    }

    if (tree.id === id) {
        return tree;
    }

    if (isGroup(tree)) {
        for (let child of tree.children) {
            let found = find(child, id);

            if (found) {
                return found;
            }
        }
    }

    return null;
}

/**
 * Rebuild the tree, giving every node to `visit` children first. `visit` returns the node to keep,
 * a replacement, or null to drop it.
 *
 * @method mapTree
 * @param {Object} node
 * @param {Function} visit
 * @return {Object|null}
 * @private
 */
function mapTree(node, visit) {
    if (isGroup(node)) {
        let children = [];
        let changed = false;

        for (let child of node.children) {
            let mapped = mapTree(child, visit);

            changed = changed || mapped !== child;

            if (mapped) {
                children.push(mapped);
            }
        }

        node = changed ? group(node.conjunction, children, node.id) : node;
    }

    return visit(node);
}

/**
 * Add a node to a group.
 *
 * @method add
 * @param {Object} tree
 * @param {String} parentId The group to add to
 * @param {Object} node The node to add
 * @param {Number} [index] Where to add it; the end by default
 * @return {Object} The new tree, or the same tree when the parent is not a group in it
 */
export function add(tree, parentId, node, index) {
    return mapTree(tree, (current) => {
        if (current.id !== parentId || !isGroup(current)) {
            return current;
        }

        let children = [...current.children];
        let at = index === undefined ? children.length : Math.max(0, Math.min(index, children.length));

        children.splice(at, 0, node);

        return group(current.conjunction, children, current.id);
    });
}

/**
 * Replace a node.
 *
 * @method replace
 * @param {Object} tree
 * @param {String} id The node to replace
 * @param {Object} node Its replacement
 * @return {Object} The new tree
 */
export function replace(tree, id, node) {
    return mapTree(tree, (current) => (current.id === id ? node : current));
}

/**
 * Remove a node. Removing the root gives an empty AND group.
 *
 * @method remove
 * @param {Object} tree
 * @param {String} id The node to remove
 * @return {Object} The new tree
 */
export function remove(tree, id) {
    if (tree && tree.id === id) {
        return group('AND', []);
    }

    return mapTree(tree, (current) => (current.id === id ? null : current));
}

/**
 * Move a node into a group. A group cannot move into itself or into one of its own children, and the
 * root cannot move.
 *
 * @method move
 * @param {Object} tree
 * @param {String} id The node to move
 * @param {String} parentId The group to move it to
 * @param {Number} [index] Where to put it in that group (counted after the node left its old place)
 * @return {Object} The new tree, or the same tree when the move is not possible
 */
export function move(tree, id, parentId, index) {
    let node = find(tree, id);
    let target = find(tree, parentId);

    if (!node || !isGroup(target) || node === tree || find(node, parentId)) {
        return tree;
    }

    return add(remove(tree, id), parentId, node, index);
}

/**
 * Set a group's conjunction.
 *
 * @method setConjunction
 * @param {Object} tree
 * @param {String} groupId
 * @param {String} conjunction 'AND' or 'OR'
 * @return {Object} The new tree
 */
export function setConjunction(tree, groupId, conjunction) {
    return mapTree(tree, (current) => {
        if (current.id !== groupId || !isGroup(current)) {
            return current;
        }

        return group(conjunction, current.children, current.id);
    });
}

/**
 * Normalize a tree: drop empty groups, unwrap groups with one child and merge a child group into its
 * parent when both have the same conjunction. The root stays a group; when nothing is left it is an
 * empty group.
 *
 * @method normalize
 * @param {Object} tree
 * @return {Object} The normalized tree
 */
export function normalize(tree) {
    let simplified = simplify(tree);

    let rootId = isGroup(tree) ? tree.id : undefined;

    if (!simplified) {
        return group('AND', [], rootId);
    }

    return isGroup(simplified) ? simplified : group('AND', [simplified], rootId);
}

/**
 * Simplify one node; null when nothing is left of it.
 *
 * @method simplify
 * @param {Object} node
 * @return {Object|null}
 * @private
 */
function simplify(node) {
    if (!isGroup(node)) {
        return node || null;
    }

    let children = [];

    for (let child of node.children) {
        let simple = simplify(child);

        if (!simple) {
            continue;
        }

        if (isGroup(simple) && simple.conjunction === node.conjunction) {
            children.push(...simple.children);
        } else {
            children.push(simple);
        }
    }

    if (children.length === 0) {
        return null;
    }

    if (children.length === 1) {
        return children[0];
    }

    let same = children.length === node.children.length && children.every((child, i) => child === node.children[i]);

    return same ? node : group(node.conjunction, children, node.id);
}
