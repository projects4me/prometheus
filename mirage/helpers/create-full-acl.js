import { ACL_MODULES, ACL_ACTIONS } from './acl-settings';

export { ACL_MODULES, ACL_ACTIONS };

/**
 * Create full-access userpermissions for every module.action.
 *
 * @param {Object} server Mirage server
 * @param {string|number} [userId='1'] User id to attach permissions to
 * @returns {Object[]} Created userpermission models
 */
export default function createFullAcl(server, userId = '1') {
    return ACL_MODULES.flatMap((module) => {
        return ACL_ACTIONS.map((action) => {
            return server.create('userpermission', {
                userId: String(userId),
                entity: `${module}.${action}`,
                allowed: '1'
            });
        });
    });
}
