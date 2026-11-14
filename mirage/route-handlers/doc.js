import { Response } from 'ember-cli-mirage';
import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';
import ensureDocReferences from '../helpers/ensure-doc-references';

export function register(server) {
	server.get('/doc', (schema, request) => {
		return applyQuery(schema.docs.all(), request);
	});

	server.get('/doc/:id', (schema, request) => {
		let record = schema.docs.find(request.params.id);
		return record || new Response(404, {}, { errors: [{ status: '404', title: 'Doc not found' }] });
	});

	server.post('/doc', (schema, request) => {
		let requestData = getRequestData(request);
		let attributes = requestData.attributes || {};
		ensureDocReferences(server, attributes);
		return server.create('doc', attributes);
	});

	server.delete('/doc/:id', (schema, request) => {
		let record = schema.docs.find(request.params.id);
		if (!record) {
			return new Response(404, {}, { errors: [{ status: '404', title: 'Doc not found' }] });
		}
		schema.taggeds.where({ relatedTo: 'doc', relatedId: record.id }).destroy();
		record.destroy();
		return record;
	});
}
