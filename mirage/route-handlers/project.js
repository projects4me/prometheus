import getRequestData from "../helpers/parse-request";
import pushObjectInModel from "../helpers/push-object-in-model";
import getValueFromQuery from "../helpers/get-value-from-query";

export function register(server, ctx) {
    server.get('/project', (schema, request) => {
        let model = schema.projects.all();
        //check if queryParams have a query object or not
        let projectQuery = request.queryParams.query;
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
}