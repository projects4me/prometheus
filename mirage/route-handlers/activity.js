export function register(server, ctx) {
    server.get('/activity', (schema) => {
        return schema.activities.all();
    });
}