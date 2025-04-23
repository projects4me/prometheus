import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
	server.get('/issuetype', (schema, request) => {
		return schema.issuetypes.all();
	});

	server.get('/issuetype/:id', (schema, request) => {
		let id = request.params.id;
		return schema.issuetypes.find(id);
	});

	server.post('/issuetype', (schema, request) => {
		let requestData = getRequestData(request);
		let issueType = server.create('issuetype', requestData.attributes);

		// Link project with issue type
		let project = schema.projects.find(issueType.projectId);
		project.update({
			issuetypes: server.schema.issuetypes.where({
				projectId: project.id
			})
		});

		ctx.set('latestCreatedIssueType', issueType);
		return issueType;
	});
}
