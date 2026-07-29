const ACTIONS = ['get', 'create', 'update', 'delete'];

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
        modelGroups: JSON.stringify({
            Issue: []
        })
    }
};

export { ACTIONS as ACL_ACTIONS, MODULES as ACL_MODULES };
