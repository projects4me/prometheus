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
}