import { Response } from 'miragejs';
import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

function duplicateCode() {
	return new Response(422, {}, { status: 'ERROR', messages: ['The short code is already in use'] });
}

export function register(server) {
	server.get('/workspace', (schema, request) => {
		let { sort, order } = request.queryParams;
		let workspaces = applyQuery(schema.workspaces.all(), request);
		if (!sort) {
			return workspaces;
		}
		let field = sort === 'createdBy.name' ? 'createdUserName' : sort.split('.').pop();
		let direction = String(order).toLowerCase() === 'desc' ? -1 : 1;
		return workspaces.sort((a, b) => direction * String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, { numeric: true }));
	});

	server.get('/workspace/:id', (schema, request) => schema.workspaces.find(request.params.id));

	server.post('/workspace', (schema, request) => {
		let requestData = getRequestData(request);
		if (schema.workspaces.findBy({ shortCode: requestData.attributes.shortCode })) {
			return duplicateCode();
		}
		return schema.workspaces.create(requestData.attributes);
	});

	server.patch('/workspace/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let workspace = schema.workspaces.find(request.params.id);
		let other = schema.workspaces.findBy({ shortCode: requestData.attributes.shortCode });
		if (other && other.id !== workspace.id) {
			return duplicateCode();
		}
		let runtimeId = requestData.attributes.runtimeId;
		if (runtimeId && schema.serviceclients.find(runtimeId)?.status === 'disabled') {
			return new Response(422, {}, { status: 'ERROR', messages: ['The runtime is disabled'] });
		}
		workspace.update(requestData.attributes);
		return workspace;
	});

	server.delete('/workspace/:id', (schema, request) => {
		let workspace = schema.workspaces.find(request.params.id);
		workspace.destroy();
		return workspace;
	});
}
