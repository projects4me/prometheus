import applyQuery from '../helpers/apply-query';

export function register(server) {
	server.get('/workflowreference', (schema, request) => {
		return applyQuery(schema.workflowreferences.all(), request);
	});
}
