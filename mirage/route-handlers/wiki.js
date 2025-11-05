export function register(server, ctx) {
    server.get('/wiki', (schema, request) => {
        return schema.wikis.all();
    });    
}