/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import getValueFromQuery from '../helpers/get-value-from-query';

export function register(server) {
	server.get('/useridentity', (schema, request) => {
		let useridentitys = schema.useridentitys.all();
		let query = request.queryParams.query;
		let userId =
			getValueFromQuery('Useridentity.userId', query) ??
			getValueFromQuery('userId', query);

		if (userId) {
			useridentitys = schema.useridentitys.where({ userId: userId.trim() });
		}

		return useridentitys;
	});

	server.post('/useridentity', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let useridentity = server.create('useridentity');

		useridentity.update(requestData.attributes);

		return useridentity;
	});

	server.patch('/useridentity/:id', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let useridentity = schema.useridentitys.find(requestData.id);

		useridentity.update(requestData.attributes);

		return useridentity;
	});

	server.delete('/useridentity/:id', (schema, request) => {
		let useridentity = schema.useridentitys.find(request.params.id);

		useridentity.destroy();

		return useridentity;
	});
}
