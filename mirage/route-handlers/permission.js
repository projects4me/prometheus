import Settings from '../helpers/acl-settings';

/**
 * Parse moduleActions catalog from ACL settings.
 *
 * @returns {Array}
 */
function getModuleActions() {
    try {
        return JSON.parse(Settings.aclSettings.moduleActions);
    } catch (e) {
        return [];
    }
}

/**
 * Ensure a catalog default permission exists (empty roleId/allowed).
 *
 * @param {Object} schema
 * @param {string} resourceName
 * @returns {Object}
 */
function findOrCreateDefault(schema, resourceName) {
    let existing = schema.permissions.where({
        resourceName,
        roleId: ''
    }).models[0];

    if (existing) {
        return existing;
    }

    return schema.permissions.create({
        resourceName,
        roleId: '',
        allowed: ''
    });
}

export function register(server) {
    server.get('/permission', (schema, request) => {
        let roleId = request.queryParams.roleId;
        let moduleActions = getModuleActions();
        let grantedByName = {};

        schema.permissions.where({ roleId }).models.forEach((permission) => {
            grantedByName[permission.resourceName] = permission;
        });

        let resultIds = [];
        moduleActions.forEach((moduleEntry) => {
            (moduleEntry.actions || []).forEach((actionEntry) => {
                let resourceName = actionEntry.resourceName;
                if (grantedByName[resourceName]) {
                    resultIds.push(grantedByName[resourceName].id);
                } else {
                    resultIds.push(findOrCreateDefault(schema, resourceName).id);
                }
            });
        });

        // Include any role-specific grants not in the catalog
        Object.values(grantedByName).forEach((permission) => {
            if (!resultIds.includes(permission.id)) {
                resultIds.push(permission.id);
            }
        });

        return schema.permissions.find(resultIds);
    });

    server.post('/permission', (schema, request) => {
        let body = JSON.parse(request.requestBody);
        let data = body.data || body;
        let attributes = data.attributes || {};
        let attrs = {
            resourceName: attributes.resourceName,
            roleId: attributes.roleId,
            allowed: attributes.allowed,
            dateCreated: attributes.dateCreated,
            dateModified: attributes.dateModified
        };
        // Defaults already exist with empty roleId; promote them on create.
        let existing = data.id ? schema.permissions.find(data.id) : null;
        if (existing) {
            return existing.update(attrs);
        }
        return schema.permissions.create({
            id: data.id,
            ...attrs
        });
    });

    server.patch('/permission/:id', (schema, request) => {
        let permission = schema.permissions.find(request.params.id);
        let body = JSON.parse(request.requestBody);
        let data = body.data || body;
        let attributes = data.attributes || {};
        return permission.update(attributes);
    });
}
