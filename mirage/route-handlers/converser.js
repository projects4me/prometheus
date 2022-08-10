export function register(server, ctx) {
    server.get('/dashboard/:id', (schema, request) => {
        let id = request.params.id;
        return schema.dashboards.find(id);
    });
}