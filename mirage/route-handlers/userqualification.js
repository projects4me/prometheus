/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import getValueFromQuery from '../helpers/get-value-from-query';

export function register(server) {
	server.get('/userqualification', (schema, request) => {
		let userqualifications = schema.userqualifications.all();
		let query = request.queryParams.query;
		let userId =
			getValueFromQuery('Userqualification.userId', query) ??
			getValueFromQuery('userId', query);

		if (userId) {
			userqualifications = schema.userqualifications.where({
				userId: userId.trim(),
			});
		}

		return userqualifications;
	});

	server.post('/userqualification', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let userqualification = server.create('userqualification');

		userqualification.update(requestData.attributes);

		return userqualification;
	});

	server.patch('/userqualification/:id', (schema, request) => {
		let requestData = JSON.parse(request.requestBody).data;
		let userqualification = schema.userqualifications.find(requestData.id);

		userqualification.update(requestData.attributes);

		return userqualification;
	});

	server.delete('/userqualification/:id', (schema, request) => {
		let userqualification = schema.userqualifications.find(
			request.params.id
		);

		userqualification.destroy();

		return userqualification;
	});
}
