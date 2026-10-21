import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/ideaplanissue', (schema, request) => {
		return applyQuery(schema.ideaplanissues.all(), request);
	});

	server.get('/ideaplanissue/:id', (schema, request) => {
		return schema.ideaplanissues.find(request.params.id);
	});

	server.post('/ideaplanissue', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('ideaplanissue', requestData.attributes);
	});

	server.patch('/ideaplanissue/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.ideaplanissues.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/ideaplanissue/:id', (schema, request) => {
		let record = schema.ideaplanissues.find(request.params.id);
		record.destroy();
		return record;
	});
}
