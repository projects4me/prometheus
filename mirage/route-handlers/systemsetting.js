export function register(server, ctx) {
    server.get('/systemsetting', (schema, request) => {
        server.createList('systemsetting', 1);

        return server.schema.systemsettings.all();
    });
}