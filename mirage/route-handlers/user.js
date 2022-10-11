import pushObjectInModel from '../helpers/push-object-in-model';
import getValueFromQuery from '../helpers/get-value-from-query';

export function register(server, ctx) {
    server.get('/user', (schema, request) => {
        let model = schema.users.all();
        let userQuery = request.queryParams.query;
        let id = getValueFromQuery(`User.id`, userQuery);
        if (id) {
            pushObjectInModel(model, schema.users.find(id));
        }
        return model;
    });

    server.get('/user/:id', (schema, request) => {
        let id = request.params.id;
        if (id === "me") {
            id = ctx.get('currentUser').id
        }
        let model = schema.users.find(id);
        return model;
    });
}