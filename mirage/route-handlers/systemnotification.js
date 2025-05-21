import Collection from 'ember-cli-mirage/orm/collection';

export function register(server, ctx) {
	// GET /systemnotifications
	server.get('/systemnotification', function (schema, request) {
		const {
			page = 1,
			limit = 10,
			query,
			sort,
			order = 'desc'
		} = request.queryParams;
		let notifications = schema.systemnotifications.all();

		if (query) {
			// Filter notifications based on the query string
			// This would need to be customized for your actual query format
		}

		// Apply sorting
		if (sort) {
			const sortField = sort.replace('Systemnotification.', '');
			notifications = notifications.sort((a, b) => {
				if (order === 'desc') {
					return a[sortField] > b[sortField] ? -1 : 1;
				} else {
					return a[sortField] > b[sortField] ? 1 : -1;
				}
			});
		}

		// Apply pagination
		const pageNumber = parseInt(page);
		const pageSize = parseInt(limit);
		const start = (pageNumber - 1) * pageSize;
		const end = start + pageSize;

		const paginatedCollection = new Collection('systemnotification', notifications.models.slice(start, end));
		return paginatedCollection;
	});

	server.get('/systemnotification/:id', function (schema, request) {
		const id = request.params.id;
		return schema.systemnotifications.find(id);
	});

	server.post('/systemnotification', function (schema, request) {
		const attrs = JSON.parse(request.requestBody);
		return schema.systemnotifications.create(attrs);
	});

	server.put('/systemnotification/:id', function (schema, request) {
		const id = request.params.id;
		const attrs = JSON.parse(request.requestBody);
		const notification = schema.systemnotifications.find(id);
		return notification.update(attrs);
	});

	server.delete('/systemnotification/:id', function (schema, request) {
		const id = request.params.id;
		return schema.systemnotifications.find(id).destroy();
	});
}
