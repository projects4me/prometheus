export function register(server, ctx) {
    server.get('/issuetype', (schema, request) => {
        return schema.issuetypes.all();
    });

    server.get('/issuetype/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuetypes.find(id);
    });

    server.post('/issuetype', (schema, request) => {
        return server.schema.issuetypes.all();
    });
}