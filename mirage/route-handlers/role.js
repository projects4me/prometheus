import { Response } from 'miragejs';
import getRequestData from "../helpers/parse-request";
import applyQuery from "../helpers/apply-query";
import sortByFields from "../helpers/model/sort-by-fields";

export function register(server, ctx) {
    server.get('/role', (schema, request) => {
        let params = request.queryParams;
        // Let the steps assert what the browser sent.
        ctx.set('roleRequests', [...(ctx.get('roleRequests') || []), { ...params }]);

        let roles = applyQuery(schema.roles.all(), request);
        // Like Gaia's CONTAINS: a case-insensitive substring match on the field.
        for (let [, field, value] of (params.query || '').matchAll(/Role\.(\w+) CONTAINS ([^)]+)/g)) {
            let needle = value.trim().replace(/^["']|["']$/g, '').toLowerCase();
            roles = roles.filter(role => String(role[field] ?? '').toLowerCase().includes(needle));
        }
        let total = roles.length;
        let hasNext = false;
        if (params.sort) {
            roles = sortByFields(params.sort, params.order, roles);
        }
        let limit = Number(params.limit);
        let page = Math.max(1, Number(params.page) || 1);
        if (limit > 0) {
            roles = roles.slice((page - 1) * limit, page * limit);
            hasNext = total > page * limit;
        }
        // Like Gaia: no total, only meta.links.next while more rows exist after this page.
        roles.meta = { links: hasNext ? { next: { href: `/role?page=${page + 1}` } } : {} };
        return roles;
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