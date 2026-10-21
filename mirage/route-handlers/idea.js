import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/idea', (schema, request) => {
		return applyQuery(schema.ideas.all(), request);
	});

	server.get('/idea/:id', (schema, request) => {
		return schema.ideas.find(request.params.id);
	});

	server.post('/idea', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('idea', requestData.attributes);
	});

	server.patch('/idea/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.ideas.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/idea/:id', (schema, request) => {
		let record = schema.ideas.find(request.params.id);
		record.destroy();
		return record;
	});
}
