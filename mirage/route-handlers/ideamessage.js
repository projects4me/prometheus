import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/ideamessage', (schema, request) => {
		return applyQuery(schema.ideamessages.all(), request);
	});

	server.get('/ideamessage/:id', (schema, request) => {
		return schema.ideamessages.find(request.params.id);
	});

	server.post('/ideamessage', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('ideamessage', requestData.attributes);
	});

	server.patch('/ideamessage/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.ideamessages.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/ideamessage/:id', (schema, request) => {
		let record = schema.ideamessages.find(request.params.id);
		record.destroy();
		return record;
	});
}
