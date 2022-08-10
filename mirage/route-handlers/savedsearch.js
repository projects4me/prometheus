export function register(server, ctx) {
    server.get('/savedsearch', (schema) => {
        return schema.savedsearches.all();
    });
}