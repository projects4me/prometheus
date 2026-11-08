import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';
import sortByFields from '../helpers/model/sort-by-fields';

export function register(server, ctx) {
	server.get('/idea', (schema, request) => {
		let params = request.queryParams;
		// Let the steps assert what the browser sent.
		ctx.set('lastIdeaQuery', params.query);
		ctx.set('ideaQueries', [...(ctx.get('ideaQueries') || []), params.query]);
		ctx.set('ideaRequests', [...(ctx.get('ideaRequests') || []), { ...params }]);

		let ideas = applyQuery(schema.ideas.all(), request);
		let total = ideas.length;
		if (params.sort) {
			ideas = sortByFields(params.sort, params.order, ideas);
		}
		let limit = Number(params.limit);
		if (limit > 0) {
			let page = Math.max(1, Number(params.page) || 1);
			ideas = ideas.slice((page - 1) * limit, page * limit);
		}
		// Gaia's list meta has no total yet; Mirage sends one so the browser's use of it is covered.
		ideas.meta = { total };
		return ideas;
	});

	server.get('/idea/:id', (schema, request) => {
		return schema.ideas.find(request.params.id);
	});

	server.post('/idea', (schema, request) => {
		let requestData = getRequestData(request);
		return server.create('idea', requestData.attributes);
	});

	server.patch('/idea/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let record = schema.ideas.find(request.params.id);
		record.update(requestData.attributes);
		return record;
	});

	server.delete('/idea/:id', (schema, request) => {
		let record = schema.ideas.find(request.params.id);
		record.destroy();
		return record;
	});
}
