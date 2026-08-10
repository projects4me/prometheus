import { Response } from 'miragejs';
import getRequestData from "../helpers/parse-request";

export function register(server, ctx) {
    server.get('/role', (schema) => {
        let data = schema.roles.all();
        let count = 1;
        let model = { data: [] };
        _.each(data.models, function (obj) {
            model.data.push({
                type: 'role',
                id: count++,
                attributes: obj.attrs
            });
        });
        return model;
    });

    server.get('/role/:id', (schema, request) => {
        let id = request.params.id;
        return schema.roles.find(id);
    });

    server.patch('/role/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let role = schema.roles.find(requestData.id);
        role.update(requestData.attributes);
        return role;
    });

    server.post('/role', (schema, request) => {
        let requestData = getRequestData(request);
        let role = server.create('role', requestData.attributes);
        return role;
    });

    server.delete('/role/:id', (schema, request) => {
        let id = request.params.id;
        let role = schema.roles.find(id);

        if (!role) {
            return new Response(404, {}, { error: 'Role not found' });
        }

        // Opt-in Mirage lockout for feature tests (mirrors Gaia SecurityCoreLockout).
        if (role.attrs.lockoutProtected || ctx.get('roleDeleteLockoutIds')?.includes(String(id))) {
            return new Response(422, {}, {
                error: 'This role cannot be deleted: no other role would retain permission, role, and userrole access.',
                suggestion: 'Grant full permission, role, and userrole access to another role with at least one assigned user before deleting this role.'
            });
        }

        role.destroy();
        return role;
    });
}