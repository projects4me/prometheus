export function register(server, ctx) {
    server.get('/issuestatus', (schema, request) => {
        return schema.issuestatuses.all();
    });

    server.get('/issuestatus/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuestatuses.find(id);
    });
}