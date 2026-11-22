import { Response } from 'miragejs';
import getValueFromQuery from '../helpers/get-value-from-query';
import getRequestData from '../helpers/parse-request';
import paginate from '../helpers/paginate';

export function register(server, ctx) {
    server.get('/membership', (schema, request) => {
        let memberships = schema.memberships.all();
        let query = request.queryParams.query;
        let fieldName = ctx.get('requestQuery')?.membership;
        let value = getValueFromQuery(fieldName, query);

        let personInProject = (query || '').match(/Membership\.projectId : (\d+)\) AND \(Membership\.userId : (\d+)/);
        if (personInProject) {
            return schema.memberships.where((membership) => String(membership.projectId) === personInProject[1] && String(membership.userId) === personInProject[2]);
        }

        let workspaceMatch = !fieldName && query ? query.match(/project\.workspaceId : ([^\s)]+)/) : null;
        if (workspaceMatch) {
            let projectIds = schema.projects.where({ workspaceId: workspaceMatch[1] }).models.map((project) => String(project.id));
            let matching = schema.memberships.where((membership) => projectIds.includes(String(membership.projectId)));
            return paginate(matching, request.queryParams);
        }

        if (!fieldName && query && query.includes('Membership.projectId')) {
            let projectIds = [...query.matchAll(/Membership\.projectId : (\d+)/g)].map((match) => match[1]);
            return schema.memberships.where((membership) => projectIds.includes(String(membership.projectId)));
        }

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

        if (project?.workspaceId && user) {
            // Gaia's member sync: the person joins every project of the workspace, shown as one Members row
            let total = schema.projects.where({ workspaceId: project.workspaceId }).models.length;
            let row = schema.workspacemembers.findBy({ workspaceId: String(project.workspaceId), userId: String(user.id) });
            if (row) {
                row.update({ projectCount: total });
            } else {
                server.create('workspacemember', { workspaceId: String(project.workspaceId), userId: String(user.id), projectCount: total, user });
            }
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
        let project = schema.projects.find(model.projectId);
        if (project?.workspaceId) {
            // Gaia's removal: open issues need handoverTo (409), then the person leaves every project of the workspace
            let projectIds = schema.projects.where({ workspaceId: project.workspaceId }).models.map((item) => String(item.id));
            let open = schema.issues.where((issue) => {
                let status = schema.issuestatuses.find(issue.statusId);
                return String(issue.assignee) === String(model.userId) && projectIds.includes(String(issue.projectId)) && String(status?.done) !== '1';
            });
            let handoverTo = request.queryParams.handoverTo;
            if (open.models.length > 0) {
                if (!handoverTo) {
                    return new Response(409, {}, { status: 'ERROR', messages: [`The member has ${open.models.length} open issue(s) in the workspace; pass handoverTo with the user who takes them over.`] });
                }
                open.models.forEach((issue) => issue.update({ assignee: String(handoverTo) }));
            }
            schema.memberships.where((item) => String(item.userId) === String(model.userId) && projectIds.includes(String(item.projectId))).destroy();
            schema.workspacemembers.where({ workspaceId: String(project.workspaceId), userId: String(model.userId) }).destroy();
            return model;
        }
        schema.memberships.find(id).destroy();
        return model;
    });
}