import getRequestData from "../helpers/parse-request";
import pushObjectInModel from "../helpers/push-object-in-model";
import getValueFromQuery from "../helpers/get-value-from-query";

export function register(server, ctx) {
    server.get('/project', (schema, request) => {
        let model = schema.projects.all();
        //check if queryParams have a query object or not
        let projectQuery = request.queryParams.query;
        if (projectQuery && projectQuery.includes('Project.workspaceId')) {
            let workspaceId = getValueFromQuery('Project.workspaceId', projectQuery);
            let projects = schema.projects.where({ workspaceId });
            let limit = Number(request.queryParams.limit);
            if (limit > 0) {
                // Like Gaia: sorted, one page, and `meta.links.next` while more rows follow
                let page = Number(request.queryParams.page) || 1;
                let rows = projects.models.slice().sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
                projects.models = rows.slice((page - 1) * limit, page * limit);
                projects.meta = { links: rows.length > page * limit ? { next: { href: `/project?page=${page + 1}` } } : {} };
            }
            return projects;
        }
        if (projectQuery) {
            const field = projectQuery.includes('Project.shortCode') ? 'Project.shortCode' : 
                 projectQuery.includes('Project.id') ? 'Project.id' : null;

            if (field) {
                const value = getValueFromQuery(field, projectQuery);
                const criteria = field === 'Project.shortCode' ? { shortCode: value.toUpperCase() } : { id: value };
                if (value) {
                    model = schema.projects.where(criteria);
                }
            }

            if (projectQuery.includes('savedsearch')) {
            pushObjectInModel(model, schema.projects.find(1));
            }
        }

        return model;
    });

    server.get('/project/:id', (schema, request) => {
        let id = request.params.id;
        return schema.projects.find(id);
    });

    server.patch('/project/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let project = schema.projects.find(requestData.id);
        project.update(requestData.attributes);
        return project;
    });

    server.post('/project', (schema, request) => {
        let requestData = getRequestData(request);
        let project = server.create('project', requestData.attributes);
        ctx.set('latestCreatedProject', project);
        return project;
    });

    server.delete('/project/:id', (schema, request) => {
        let project = schema.projects.find(request.params.id);
        project.destroy();
        return project;
    });
}