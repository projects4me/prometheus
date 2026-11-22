/**
 * The repositories of the projects, filtered by `Repository.projectId CONTAINS id1,id2` and limited like Gaia.
 */
export function register(server) {
    server.get('/repository', (schema, request) => {
        let { query, limit } = request.queryParams;
        let match = /Repository\.projectId CONTAINS ([^)]+)\)/.exec(query || '');
        let repositories = schema.repositories.all();
        if (match) {
            let ids = match[1].split(',').map((id) => id.trim());
            repositories = repositories.filter((repository) => ids.includes(String(repository.projectId)));
        }
        if (Number(limit) > 0) {
            repositories.models = repositories.models.slice(0, Number(limit));
        }
        return repositories;
    });
}
