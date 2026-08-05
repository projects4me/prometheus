import { ACL_MODULES, ACL_ACTIONS, ACL_FIELD_ACTIONS, buildModuleFields } from './acl-settings';

export { ACL_MODULES, ACL_ACTIONS };

/**
 * Create full-access userpermissions for every module.action and catalogued
 * field-action triples (runtime ACL still evaluates get/create/update).
 *
 * @param {Object} server Mirage server
 * @param {string|number} [userId='1'] User id to attach permissions to
 * @returns {Object[]} Created userpermission models
 */
export default function createFullAcl(server, userId = '1') {
    let modulePerms = ACL_MODULES.flatMap((module) => {
        return ACL_ACTIONS.map((action) => {
            return server.create('userpermission', {
                userId: String(userId),
                entity: `${module}.${action}`,
                allowed: '1'
            });
        });
    });

    let fieldPerms = buildModuleFields().flatMap((moduleEntry) => {
        return (moduleEntry.fields || []).flatMap((fieldEntry) => {
            return ACL_FIELD_ACTIONS.map((action) => {
                return server.create('userpermission', {
                    userId: String(userId),
                    entity: `${moduleEntry.module}.${fieldEntry.field}.${action}`,
                    allowed: '1'
                });
            });
        });
    });

    return modulePerms.concat(fieldPerms);
}
