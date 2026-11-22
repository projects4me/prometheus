import paginate from '../helpers/paginate';

export function register(server) {
    server.get('/workspacemember', (schema, request) => {
        let match = (request.queryParams.query || '').match(/Workspacemember\.workspaceId : ([^\s)]+)/);
        let members = match ? schema.workspacemembers.where({ workspaceId: match[1] }) : schema.workspacemembers.all();
        return paginate(members, request.queryParams);
    });
}
