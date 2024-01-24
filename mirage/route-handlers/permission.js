export function register(server, ctx) {
    server.get('/permission', (schema, request) => {
        let permissions = [];
        let roleId = request.queryParams.roleId;
        permissions = server.schema.permissions.all().filter((permission) => {
            if (permission.roleId === roleId) {
                return permission;
            }
        });
        return permissions;
    });
}