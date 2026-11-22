import paginate from '../helpers/paginate';

export function register(server) {
    server.get('/workspacemilestone', (schema, request) => {
        let match = (request.queryParams.query || '').match(/Workspacemilestone\.workspaceId : ([^\s)]+)/);
        let milestones = match ? schema.workspacemilestones.where({ workspaceId: match[1] }) : schema.workspacemilestones.all();
        return paginate(milestones, request.queryParams);
    });
}
