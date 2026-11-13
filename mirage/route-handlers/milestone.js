import { Collection, Response } from 'miragejs';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
	server.get('/milestone', (schema, request) => {
		let params = request.queryParams;
		// Let the steps assert what the browser sent.
		ctx.set('milestoneRequests', [...(ctx.get('milestoneRequests') || []), { ...params }]);

		if (ctx.get('milestonePageFails') && Number(params.page) > 1) {
			return new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] });
		}

		let milestones = schema.milestones.all();
		if (params.sort === 'Milestone.startDate') {
			// Like Gaia, order by the start date
			let direction = params.order === 'DESC' ? -1 : 1;
			milestones = new Collection('milestone', [...milestones.models].sort((a, b) => direction * String(a.startDate).localeCompare(String(b.startDate))));
		}
		let limit = Number(params.limit);
		if (limit > 0 && (ctx.get('paginateMilestones') || params.page)) {
			let page = Math.max(1, Number(params.page) || 1);
			let total = milestones.length;
			milestones = new Collection('milestone', milestones.models.slice((page - 1) * limit, page * limit));
			// Like Gaia: no total, only meta.links.next while more rows exist after this page.
			milestones.meta = { links: total > page * limit ? { next: { href: `/milestone?page=${page + 1}` } } : {} };
		}
		return milestones;
	});

	server.get('/milestone/:id', (schema, request) => {
		let id = request.params.id;
		return schema.milestones.find(id);
	});

	server.post('/milestone', function (schema, request) {
		const attrs = JSON.parse(request.requestBody);
		return schema.milestones.create(attrs);
	})

	server.patch('/milestone/:id', (schema, request) => {
		let id = request.params.id;
		let requestData = getRequestData(request);
		let milestone = schema.milestones.find(id);
		milestone.update(requestData.attributes);
		return milestone;
	});
}
