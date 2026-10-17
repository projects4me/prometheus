import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
	server.get('/issuetype', (schema, request) => {
		let query = request.queryParams.query || '';

		// Settings asks for the default (system) types only.
		if (query.includes('Issuetype.system : 1')) {
			return schema.issuetypes.where({ system: '1' });
		}

		return schema.issuetypes.all();
	});

	server.get('/issuetype/:id', (schema, request) => {
		let id = request.params.id;
		return schema.issuetypes.find(id);
	});

	server.post('/issuetype', (schema, request) => {
		let requestData = getRequestData(request);
		let issueType = server.create('issuetype', requestData.attributes);

		// Link project with issue type (system types have no project)
		let project = issueType.projectId ? schema.projects.find(issueType.projectId) : null;
		if (project) {
			project.update({
				issuetypes: server.schema.issuetypes.where({
					projectId: project.id
				})
			});
		}

		ctx.set('latestCreatedIssueType', issueType);
		return issueType;
	});

	server.patch('/issuetype/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let issueType = schema.issuetypes.find(request.params.id);
		issueType.update(requestData.attributes);
		return issueType;
	});

	server.delete('/issuetype/:id', (schema, request) => {
		let issueType = schema.issuetypes.find(request.params.id);
		issueType.destroy();
		return issueType;
	});
}
