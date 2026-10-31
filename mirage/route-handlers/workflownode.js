import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/workflownode', (schema, request) => {
		return applyQuery(schema.workflownodes.all(), request);
	});

	server.get('/workflownode/:id', (schema, request) => {
		return schema.workflownodes.find(request.params.id);
	});

	server.post('/workflownode', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('workflownode', requestData.attributes);
	});

	server.patch('/workflownode/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.workflownodes.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/workflownode/:id', (schema, request) => {
		let record = schema.workflownodes.find(request.params.id);
		record.destroy();
		return record;
	});
}
