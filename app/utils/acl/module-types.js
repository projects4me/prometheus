/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Canonical classification of ACL modules into system / user / project scope.
 *
 * System modules — platform administration; typically managed by an
 *   administrator or a role carrying elevated authority.
 *
 * User modules — user accounts and profile data (not project-bound).
 *
 * Project modules — scoped to a particular project; permissions for these
 *   modules are configured in the context of individual project membership.
 *
 * @module Utils.Acl.ModuleTypes
 * @namespace Prometheus.Utils
 * @author Rana Nouman <ranamnouman@gmail.com>
 */

/**
 * Map of scope → list of module names belonging to that scope.
 *
 * @constant MODULE_SCOPE
 * @type {Object}
 */
export const MODULE_SCOPE = {
    /**
     * Platform administration modules.
     * Only admins or roles with elevated authority should configure these.
     *
     * - user             : platform user accounts
     * - role             : role definitions
     * - userrole         : role assignments to users
     * - permission       : ACL permission records (admin-level)
     * - issuetype        : global issue type catalog
     * - issuestatus      : global issue status catalog
     */
    system: [
        'user',
        'role',
        'userrole',
        'permission',
        'issuetype',
        'issuestatus'
    ],

    /**
     * User profile extension modules (not tied to a project).
     *
     * - userqualification: user profile — education/qualifications
     * - userskill        : user profile — skills
     */
    user: [
        'userqualification',
        'userskill'
    ],

    /**
     * Modules whose data is inherently tied to a project.
     * Permissions for these are exercised within a project context.
     *
     * - project          : the project resource itself
     * - issue            : issues belong to a project
     * - milestone        : milestones belong to a project
     * - milestoneoverview: aggregated view of project milestones
     * - wiki             : wiki pages belong to a project
     * - comment          : comments on project issues
     * - membership       : user ↔ project link
     * - conversationroom : conversation rooms in a project
     * - timelog          : time logged against project issues
     * - chatroom         : chat rooms tied to a project
     * - upload           : file uploads on project resources
     * - activity         : activity feed for a project
     * - tag              : tags applied to project resources
     * - issuewatcher     : watchers subscribed to project issues
     * - vote             : votes on project conversations / wikis
     * - issueplanning    : sprint / planning assignments for project issues
     * - savedsearch      : saved filters (often project-scoped via projectId)
     */
    project: [
        'project',
        'issue',
        'milestone',
        'milestoneoverview',
        'wiki',
        'comment',
        'membership',
        'conversationroom',
        'timelog',
        'chatroom',
        'upload',
        'activity',
        'tag',
        'issuewatcher',
        'vote',
        'issueplanning',
        'savedsearch'
    ]
};

/**
 * Derive the scope ('system' | 'user' | 'project') for a given module name.
 *
 * Unknown modules default to 'project' so they still appear in the role UI.
 *
 * @function getModuleScope
 * @param {string} moduleName
 * @returns {'system'|'user'|'project'}
 */
export function getModuleScope(moduleName) {
    if (MODULE_SCOPE.system.includes(moduleName)) {
        return 'system';
    }
    if (MODULE_SCOPE.user.includes(moduleName)) {
        return 'user';
    }
    return 'project';
}
