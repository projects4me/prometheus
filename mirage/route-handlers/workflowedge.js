import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/workflowedge', (schema, request) => {
		return applyQuery(schema.workflowedges.all(), request);
	});

	server.get('/workflowedge/:id', (schema, request) => {
		return schema.workflowedges.find(request.params.id);
	});

	server.post('/workflowedge', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('workflowedge', requestData.attributes);
	});

	server.patch('/workflowedge/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.workflowedges.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/workflowedge/:id', (schema, request) => {
		let record = schema.workflowedges.find(request.params.id);
		record.destroy();
		return record;
	});
}
