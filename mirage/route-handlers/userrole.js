/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import getValueFromQuery from '../helpers/get-value-from-query';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
	server.get('/userrole', (schema, request) => {
		let userroles = schema.userroles.all();
		let query = request.queryParams.query;
		let fieldName = ctx.get('requestQuery')?.userrole;
		let value = getValueFromQuery(fieldName, query);

		if (fieldName) {
			userroles = schema.userroles.where({ [fieldName]: value });
		}
		return userroles;
	});

	server.post('/userrole', (schema, request) => {
		let requestData = getRequestData(request);
		let userrole = server.create('userrole', requestData.attributes);
		return userrole;
	});

	server.patch('/userrole/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let userrole = schema.userroles.find(requestData.id);
		userrole.update(requestData.attributes);
		return userrole;
	});

	server.put('/userrole/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let userrole = schema.userroles.find(requestData.id);
		userrole.update(requestData.attributes);
		return userrole;
	});

	server.delete('/userrole/:id', (schema, request) => {
		let id = request.params.id;
		let model = schema.userroles.find(id);
		schema.userroles.find(id).destroy();
		return model;
	});
}
