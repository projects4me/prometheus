/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { get } from '@ember/object';

/**
 * The access summary of roles: permission coverage, access tier, members and initials, shared by the role browser.
 *
 * @module Utils.Role
 */

/**
 * Action-level permission resource names (e.g. "issue.get", "role.delete") are those whose second dot-segment is one
 * of the four CRUD verbs. Field-mode permissions ("issue.subject") are left out so the denominator reflects the
 * privilege surface rather than the schema width.
 *
 * @property ACTION_VERBS
 * @type Set
 */
export const ACTION_VERBS = new Set(['get', 'create', 'update', 'delete']);

/**
 * The access tiers from the most to the least access, the order the browser groups them in
 *
 * @property TIERS
 * @type Array
 */
export const TIERS = ['high', 'elevated', 'medium', 'low', 'none'];

/**
 * Turns a value that may be a RecordArray into a plain array
 *
 * @method toList
 * @param {*} records
 * @returns {Array}
 * @private
 */
function toList(records) {
    if (!records) {
        return [];
    }
    return typeof records.toArray === 'function' ? records.toArray() : Array.from(records);
}

/**
 * Whether an action permission counts as granted for coverage. Matches the ACL semantics: unset or empty is the
 * permissive default (grant), '0' is an explicit deny, '1' (all) and '2' (members) are grants.
 *
 * @method isActionAllowed
 * @param {*} allowed
 * @returns {Boolean}
 */
export function isActionAllowed(allowed) {
    if (allowed === '0' || allowed === 0) {
        return false;
    }
    if (allowed === '' || allowed === null || allowed === undefined) {
        return true;
    }
    return allowed === '1' || allowed === 1 || allowed === '2' || allowed === 2 || allowed === true;
}

/**
 * Flattens the permissions of a role into plain coverage entries stamped with that role's id (the catalog defaults
 * Gaia sends have an empty roleId)
 *
 * @method toCoverageEntries
 * @param {String} roleId
 * @param {*} permissions Permission records, plain entries or a RecordArray
 * @returns {Array<{roleId: String, resourceName: String, allowed: *}>}
 */
export function toCoverageEntries(roleId, permissions) {
    return toList(permissions)
        .map(permission => ({
            roleId: String(roleId),
            resourceName: get(permission, 'resourceName') || '',
            allowed: get(permission, 'allowed')
        }))
        .filter(entry => entry.resourceName);
}

/**
 * The number of action permissions and of those granted, over the entries of one role
 *
 * @method actionTotals
 * @param {Array} entries Coverage entries of one role
 * @returns {{allowed: Number, total: Number}}
 */
export function actionTotals(entries) {
    let totals = { allowed: 0, total: 0 };
    for (let entry of entries || []) {
        let parts = (entry.resourceName || '').split('.');
        if (parts.length !== 2 || !ACTION_VERBS.has(parts[1])) {
            continue;
        }
        totals.total++;
        if (isActionAllowed(entry.allowed)) {
            totals.allowed++;
        }
    }
    return totals;
}

/**
 * The share of granted action permissions of every role, in percent, by role id; a role without entries is left out
 *
 * @method coverageByRole
 * @param {Array} entries Coverage entries of any number of roles
 * @returns {Object}
 */
export function coverageByRole(entries) {
    let stats = {};
    for (let entry of entries || []) {
        let parts = (entry.resourceName || '').split('.');
        if (parts.length !== 2 || !ACTION_VERBS.has(parts[1])) {
            continue;
        }
        let roleId = String(entry.roleId);
        stats[roleId] = stats[roleId] || { total: 0, allowed: 0 };
        stats[roleId].total++;
        if (isActionAllowed(entry.allowed)) {
            stats[roleId].allowed++;
        }
    }
    let coverage = {};
    for (let [roleId, { total, allowed }] of Object.entries(stats)) {
        coverage[roleId] = Math.round((allowed / total) * 100);
    }
    return coverage;
}

/**
 * The id of the role of a user assignment: its roleId, or the id its role relationship links
 *
 * @method userroleRoleId
 * @param {Object} userrole
 * @returns {String|null}
 */
export function userroleRoleId(userrole) {
    let roleId = get(userrole, 'roleId');
    if (!roleId && typeof userrole?.belongsTo === 'function') {
        roleId = userrole.belongsTo('role').id();
    }
    return roleId ? String(roleId) : null;
}

/**
 * The users assigned to every role as plain `{ id, name }` objects (so avatar templates never touch a belongsTo
 * proxy), by role id
 *
 * @method membersByRole
 * @param {Array} userroles Userrole records with their user
 * @returns {Object}
 */
export function membersByRole(userroles) {
    let byRole = {};
    for (let userrole of toList(userroles)) {
        let roleId = String(userroleRoleId(userrole) || '');
        // belongsTo may be a PromiseProxy: always use Ember.get, never `.id`
        let user = get(userrole, 'user');
        let userId = user ? get(user, 'id') : null;
        if (!roleId || !userId) {
            continue;
        }
        byRole[roleId] = byRole[roleId] || [];
        byRole[roleId].push({ id: userId, name: get(user, 'name') || '' });
    }
    return byRole;
}

/**
 * The access tier of a coverage percentage: high, elevated, medium, low, or none while it is unknown
 *
 * @method accessTier
 * @param {Number} [coverage]
 * @returns {String}
 */
export function accessTier(coverage) {
    if (coverage === undefined || coverage === null) {
        return 'none';
    }
    if (coverage >= 75) {
        return 'high';
    }
    if (coverage >= 50) {
        return 'elevated';
    }
    if (coverage >= 25) {
        return 'medium';
    }
    return 'low';
}

/**
 * The initials of a role name: the first letters of its first two words, upper case
 *
 * @method roleInitials
 * @param {String} [name]
 * @returns {String}
 */
export function roleInitials(name) {
    return (name || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}

/**
 * The granted and denied access percentages of a coverage, both 0 while it is unknown
 *
 * @method accessSplit
 * @param {Number} [coverage]
 * @returns {{known: Boolean, granted: Number, denied: Number}}
 */
export function accessSplit(coverage) {
    if (coverage === undefined || coverage === null || Number.isNaN(Number(coverage))) {
        return { known: false, granted: 0, denied: 0 };
    }
    let granted = Math.max(0, Math.min(100, Number(coverage)));
    return { known: true, granted, denied: 100 - granted };
}
