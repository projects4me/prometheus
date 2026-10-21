import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/ideaplan', (schema, request) => {
		return applyQuery(schema.ideaplans.all(), request);
	});

	server.get('/ideaplan/:id', (schema, request) => {
		return schema.ideaplans.find(request.params.id);
	});

	server.post('/ideaplan', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('ideaplan', requestData.attributes);
	});

	server.patch('/ideaplan/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.ideaplans.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/ideaplan/:id', (schema, request) => {
		let record = schema.ideaplans.find(request.params.id);
		record.destroy();
		return record;
	});
}
