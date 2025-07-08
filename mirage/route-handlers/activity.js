import paginate from '../helpers/paginate';

export function register(server, ctx) {
	server.get('/activity', (schema, request) => {
		let model = schema.activities.all();
		if (ctx.get('paginateActivities')) {
			const paginatedModels = paginate(model, request.queryParams);
			return paginatedModels;
		}
		if (typeof ctx.get('customCallback') === 'function') {
			return ctx.get('customCallback')(model);
		}
		return model;
	});
}
