const ACTIONS = ['get', 'create', 'update', 'delete'];
const FIELD_ACTIONS = ['get', 'create', 'update'];

const MODULES = [
    'project',
    'issue',
    'wiki',
    'user',
    'role',
    'membership',
    'userrole',
    'conversationroom',
    'comment',
    'milestone',
    'tag',
    'savedsearch',
    'upload',
    'activity',
    'timelog',
    'chatroom',
    'issuetype',
    'issuestatus'
];

/**
 * Representative business-field catalog for Mirage (mirrors backend eligibility rules:
 * no id/FKs, no linkedTo titles, no secure, no acl=>false).
 */
const MODULE_FIELDS = {
    user: ['email', 'dateOfBirth', 'phone', 'accountStatus', 'title', 'timezone', 'language'],
    issue: ['subject', 'description', 'status', 'priority', 'startDate', 'endDate'],
    project: ['description', 'shortCode', 'status', 'type', 'scope', 'vision'],
    timelog: ['days', 'hours', 'minutes', 'description', 'spentOn', 'context'],
    milestone: ['name', 'description', 'status', 'milestoneType', 'startDate', 'endDate'],
    wiki: ['status', 'locked', 'markUp'],
    comment: ['comment', 'relatedName'],
    conversationroom: ['subject', 'description', 'roomType']
};

/**
 * Build moduleActions catalog for ACL settings / Mirage defaults.
 *
 * @returns {Array<{module: string, actions: Array<{action: string, resourceName: string}>}>}
 */
export function buildModuleActions() {
    return MODULES.map((module) => ({
        module,
        actions: ACTIONS.map((action) => ({
            action,
            resourceName: `${module}.${action}`
        }))
    }));
}

/**
 * Build moduleFields catalog for ACL settings / Mirage defaults.
 * Public catalog: one mode resource per field (`issue.subject`).
 *
 * @returns {Array<{module: string, fields: Array<{field: string, resourceName: string, modes: string[]}>}>}
 */
export function buildModuleFields() {
    return Object.keys(MODULE_FIELDS).map((module) => ({
        module,
        fields: MODULE_FIELDS[module].map((field) => ({
            field,
            resourceName: `${module}.${field}`,
            modes: ['none', 'read', 'write']
        }))
    }));
}

/**
 * Expand field-mode allowed into get/create/update flags (mirrors Gaia Permission).
 *
 * @param {string} mode none|read|write
 * @returns {{get: string, create: string, update: string}}
 */
export function expandFieldAccessMode(mode) {
    switch (mode) {
        case 'none':
            return { get: '0', create: '0', update: '0' };
        case 'read':
            return { get: '1', create: '0', update: '0' };
        case 'write':
            return { get: '1', create: '1', update: '1' };
        default:
            throw new Error(`Unsupported field access mode: ${mode}`);
    }
}

/**
 * Derive field access mode from stored get/create/update flags.
 *
 * @param {{get: *, create: *, update: *}} flags
 * @returns {string} none|read|write
 */
export function deriveFieldAccessMode(flags) {
    let normalize = (v) => {
        if (v === null || v === undefined || v === '') {
            return null;
        }
        return Number(v) > 0 ? 1 : 0;
    };
    let get = normalize(flags.get);
    let create = normalize(flags.create);
    let update = normalize(flags.update);

    if (create === 1 || update === 1) {
        return 'write';
    }
    if (get === 1) {
        return 'read';
    }
    if (get === 0 && create === 0 && update === 0) {
        return 'none';
    }
    return 'write';
}

/**
 * Whether a resourceName is an internal field-action triple.
 *
 * @param {string} resourceName
 * @returns {boolean}
 */
export function isFieldActionResource(resourceName) {
    let parts = String(resourceName || '').split('.');
    return parts.length === 3 && FIELD_ACTIONS.includes(parts[2]);
}

/**
 * ACL settings shape used by Mirage systemsetting factory and permission defaults.
 * Nested values are JSON strings to match the backend / json transform.
 */
export default {
    aclSettings: {
        apiOptions: JSON.stringify({
            allow: '1',
            none: '0'
        }),
        moduleActions: JSON.stringify(buildModuleActions()),
        moduleFields: JSON.stringify(buildModuleFields()),
        modelGroups: JSON.stringify({
            Issue: []
        })
    }
};

export {
    ACTIONS as ACL_ACTIONS,
    FIELD_ACTIONS as ACL_FIELD_ACTIONS,
    MODULES as ACL_MODULES,
    MODULE_FIELDS as ACL_MODULE_FIELDS
};
