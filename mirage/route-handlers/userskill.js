/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import getValueFromQuery from '../helpers/get-value-from-query';

export function register(server) {
	server.get('/userskill', (schema, request) => {
		let userskills = schema.userskills.all();
		let query = request.queryParams.query;
		let userId =
			getValueFromQuery('Userskill.userId', query) ??
			getValueFromQuery('userId', query);

		if (userId) {
			userskills = schema.userskills.where({ userId: userId.trim() });
		}

		return userskills;
	});

	server.post('/userskill', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let userskill = server.create('userskill');

		userskill.update(requestData.attributes);

		return userskill;
	});

	server.patch('/userskill/:id', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let userskill = schema.userskills.find(requestData.id);

		userskill.update(requestData.attributes);

		return userskill;
	});

	server.delete('/userskill/:id', (schema, request) => {
		let userskill = schema.userskills.find(request.params.id);

		userskill.destroy();

		return userskill;
	});
}
