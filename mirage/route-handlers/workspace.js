import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/workspace', (schema, request) => applyQuery(schema.workspaces.all(), request));

	server.get('/workspace/:id', (schema, request) => schema.workspaces.find(request.params.id));

	server.post('/workspace', (schema, request) => {
		let requestData = getRequestData(request);
		return schema.workspaces.create(requestData.attributes);
	});

	server.patch('/workspace/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let workspace = schema.workspaces.find(request.params.id);
		workspace.update(requestData.attributes);
		return workspace;
	});

	server.delete('/workspace/:id', (schema, request) => {
		let workspace = schema.workspaces.find(request.params.id);
		workspace.destroy();
		return workspace;
	});
}
