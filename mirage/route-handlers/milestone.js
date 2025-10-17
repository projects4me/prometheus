import paginate from '../helpers/paginate';

export function register(server, ctx) {
	server.get('/milestone', (schema, request) => {
		let model = schema.milestones.all();
		if (ctx.get('paginateMilestones')) {
			const paginatedModels = paginate(model, request.queryParams);
			return paginatedModels;
		}
		return model;
	});

	server.get('/milestone/:id', (schema, request) => {
		let id = request.params.id;
		return schema.milestones.find(id);
	});

	server.post('/milestone', function (schema, request) {
		const attrs = JSON.parse(request.requestBody);
		return schema.milestones.create(attrs);
	})
}
