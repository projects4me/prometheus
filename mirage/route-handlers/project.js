import getRequestData from "../helpers/parse-request";
import pushObjectInModel from "../helpers/push-object-in-model";

export function register(server, ctx) {
    server.get('/project', (schema, request) => {
        let model = schema.projects.all();

        //check if queryParams have a query object or not
        let projectQuery = request.queryParams.query;

        //if user has requested a saved search then return one project
        if (projectQuery.indexOf("savedsearch") >= 0) {
            pushObjectInModel(model, schema.projects.find(1));
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