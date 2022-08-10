export function register(server, ctx) {
    server.get('/milestone', (schema) => {
        let model = schema.milestones.all();
        return model;
    });

    server.get('/milestone/:id', (schema, request) => {
        let id = request.params.id;
        return schema.milestones.find(id);
    });
}