import pushObjectInModel from '../helpers/push-object-in-model';
import getValueFromQuery from '../helpers/get-value-from-query';
import getRequestData from "../helpers/parse-request";

export function register(server, ctx) {
    server.get('/user', (schema, request) => {
        let model = schema.users.all();
        let userQuery = request.queryParams.query;

        let field = ctx.get('fieldSearched');
        field = field ? field : 'User.id';

        let value = getValueFromQuery(field, userQuery);

        if (value && field == 'User.id') {
            pushObjectInModel(model, schema.users.find(value));
        } else if (value) {
            field = field.replace('User.', '');
            model = schema.users.where({ [field]: value });
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

    server.patch('/user/:id', (schema, request) => {
        let id = request.params.id;
        let requestData = getRequestData(request);
        let user = schema.users.find(id);

        user.update(requestData.attributes);

        return user;
    });

    server.delete('/user/:id', (schema, request) => {
        let id = request.params.id;
        let model = schema.users.find(id);
        schema.users.find(id).destroy();
        return model;
    });
}