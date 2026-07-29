import getValueFromQuery from '../helpers/get-value-from-query';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    server.get('/membership', (schema, request) => {
        let memberships = schema.memberships.all();
        let query = request.queryParams.query;
        let fieldName = ctx.get('requestQuery')?.membership;
        let value = getValueFromQuery(fieldName, query);

        if (fieldName) {
            memberships = schema.memberships.where({ [fieldName]: value });
        }
        return memberships;
    });

    server.post('membership', (schema, request) => {
        let requestData = getRequestData(request);
        let attrs = { ...(requestData.attributes || {}) };

        let userRel = requestData.relationships?.user?.data;
        let projectRel = requestData.relationships?.project?.data;
        if (userRel?.id && !attrs.userId) {
            attrs.userId = String(userRel.id);
        }
        if (projectRel?.id && !attrs.projectId) {
            attrs.projectId = String(projectRel.id);
        }

        let membership = server.create('membership', attrs);

        let project = schema.projects.find(membership.projectId);
        let user = schema.users.find(membership.userId);
        if (project && user) {
            let members = project.members;
            if (members && typeof members.add === 'function') {
                project.update({ members: members.add(user) });
            }
            membership.update({ project, user });
        }

        return membership;
    });

    server.patch('/membership/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let membership = schema.memberships.find(requestData.id);
        membership.update(requestData.attributes);
        return membership;
    });    

    server.delete('/membership/:id', (schema, request) => {
        let id = request.params.id;
        let model = schema.memberships.find(id);
        schema.memberships.find(id).destroy();
        return model;
    });
}