import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';
import limitModel from '../helpers/limit-model';
import exportResponse from '../helpers/export-response';

export function register(server) {
	server.get('/workflow', (schema, request) => {
		if (request.queryParams.export) {
			return exportResponse('workflow', request);
		}
		let workflows = applyQuery(schema.workflows.all(), request);
		return limitModel(request.queryParams.limit, workflows, request.queryParams.page);
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
