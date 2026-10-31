import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/workflow', (schema, request) => {
		return applyQuery(schema.workflows.all(), request);
	});

	server.get('/workflow/:id', (schema, request) => {
		return schema.workflows.find(request.params.id);
	});

	server.post('/workflow', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('workflow', requestData.attributes);
	});

	server.patch('/workflow/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.workflows.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/workflow/:id', (schema, request) => {
		let record = schema.workflows.find(request.params.id);
		record.destroy();
		return record;
	});
}
