import Settings, {
    expandFieldAccessMode,
    deriveFieldAccessMode,
    isFieldActionResource,
    ACL_FIELD_ACTIONS
} from '../helpers/acl-settings';

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
 * Parse moduleFields catalog from ACL settings.
 *
 * @returns {Array}
 */
function getModuleFields() {
    try {
        return JSON.parse(Settings.aclSettings.moduleFields || '[]');
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

/**
 * Collect public catalog resourceNames (module actions + field modes).
 *
 * @returns {string[]}
 */
function getCatalogResourceNames() {
    let names = [];

    getModuleActions().forEach((moduleEntry) => {
        (moduleEntry.actions || []).forEach((actionEntry) => {
            names.push(actionEntry.resourceName);
        });
    });

    getModuleFields().forEach((moduleEntry) => {
        (moduleEntry.fields || []).forEach((fieldEntry) => {
            if (fieldEntry.resourceName) {
                names.push(fieldEntry.resourceName);
            }
        });
    });

    return names;
}

/**
 * Whether resourceName is a public field-mode catalog entry.
 *
 * @param {string} resourceName
 * @returns {boolean}
 */
function isFieldModeResource(resourceName) {
    return getModuleFields().some((moduleEntry) => {
        return (moduleEntry.fields || []).some((fieldEntry) => {
            return fieldEntry.resourceName === resourceName;
        });
    });
}

/**
 * Upsert a permission row by roleId + resourceName.
 *
 * @param {Object} schema
 * @param {string} roleId
 * @param {string} resourceName
 * @param {string} allowed
 * @returns {Object}
 */
function upsertPermissionRow(schema, roleId, resourceName, allowed) {
    let existing = schema.permissions.where({ roleId, resourceName }).models[0];
    if (existing) {
        return existing.update({ allowed });
    }
    return schema.permissions.create({
        resourceName,
        roleId,
        allowed
    });
}

/**
 * Expand field mode into triples; return synthetic mode permission.
 *
 * @param {Object} schema
 * @param {Object} attributes
 * @returns {Object}
 */
function saveFieldModePermission(schema, attributes) {
    let resourceName = attributes.resourceName;
    let roleId = attributes.roleId;
    let mode = attributes.allowed === undefined || attributes.allowed === null
        ? ''
        : String(attributes.allowed);
    let [moduleName, field] = resourceName.split('.');

    if (!roleId) {
        throw new Error('Please specify roleId');
    }

    if (mode === '') {
        ACL_FIELD_ACTIONS.forEach((action) => {
            let actionResource = `${moduleName}.${field}.${action}`;
            let row = schema.permissions.where({ roleId, resourceName: actionResource }).models[0];
            if (row) {
                row.destroy();
            }
        });
        let modeRow = schema.permissions.where({ roleId, resourceName }).models[0];
        if (modeRow) {
            modeRow.destroy();
        }
        return findOrCreateDefault(schema, resourceName);
    }

    let flags = expandFieldAccessMode(mode);
    ACL_FIELD_ACTIONS.forEach((action) => {
        let actionResource = `${moduleName}.${field}.${action}`;
        upsertPermissionRow(schema, roleId, actionResource, flags[action]);
    });

    // Client-facing mode row (separate from action triples).
    return upsertPermissionRow(schema, roleId, resourceName, mode);
}

/**
 * Collapse role field-action triples into mode permissions for list responses.
 *
 * @param {Object} schema
 * @param {string} roleId
 * @returns {Object} grantedByName for public resources
 */
function collapseAppliedPermissions(schema, roleId) {
    let grantedByName = {};
    let fieldFlags = {};

    schema.permissions.where({ roleId }).models.forEach((permission) => {
        let resourceName = permission.resourceName;
        if (isFieldActionResource(resourceName)) {
            let parts = resourceName.split('.');
            let modeResource = `${parts[0]}.${parts[1]}`;
            let action = parts[2];
            if (!fieldFlags[modeResource]) {
                fieldFlags[modeResource] = { get: null, create: null, update: null, id: permission.id };
            }
            fieldFlags[modeResource][action] = permission.allowed;
            if (action === 'get') {
                fieldFlags[modeResource].id = permission.id;
            }
            return;
        }

        // Skip accidental mode rows stored in DB if any; rebuild below from triples.
        if (isFieldModeResource(resourceName)) {
            return;
        }

        grantedByName[resourceName] = permission;
    });

    Object.keys(fieldFlags).forEach((modeResource) => {
        let flags = fieldFlags[modeResource];
        let hasAny = flags.get !== null || flags.create !== null || flags.update !== null;
        let allowed = hasAny ? deriveFieldAccessMode(flags) : '';
        grantedByName[modeResource] = upsertPermissionRow(schema, roleId, modeResource, allowed);
    });

    return grantedByName;
}

export function register(server) {
    server.get('/permission', (schema, request) => {
        let roleId = request.queryParams.roleId;
        let catalogNames = getCatalogResourceNames();
        let grantedByName = roleId ? collapseAppliedPermissions(schema, roleId) : {};

        let resultIds = [];
        catalogNames.forEach((resourceName) => {
            if (grantedByName[resourceName]) {
                resultIds.push(grantedByName[resourceName].id);
            } else {
                resultIds.push(findOrCreateDefault(schema, resourceName).id);
            }
        });

        return schema.permissions.find(resultIds);
    });

    server.post('/permission', (schema, request) => {
        let body = JSON.parse(request.requestBody);
        let data = body.data || body;
        let attributes = data.attributes || {};

        if (isFieldActionResource(attributes.resourceName)) {
            throw new Error('Field action permissions cannot be set directly');
        }

        if (isFieldModeResource(attributes.resourceName)) {
            return saveFieldModePermission(schema, attributes);
        }

        let attrs = {
            resourceName: attributes.resourceName,
            roleId: attributes.roleId,
            allowed: attributes.allowed,
            dateCreated: attributes.dateCreated,
            dateModified: attributes.dateModified
        };
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
        let attributes = Object.assign({}, data.attributes || {}, {
            resourceName: (data.attributes && data.attributes.resourceName) || permission.resourceName,
            roleId: (data.attributes && data.attributes.roleId) || permission.roleId
        });

        if (isFieldActionResource(attributes.resourceName)) {
            throw new Error('Field action permissions cannot be set directly');
        }

        if (isFieldModeResource(attributes.resourceName)) {
            return saveFieldModePermission(schema, attributes);
        }

        return permission.update(data.attributes || {});
    });
}
