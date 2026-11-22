import paginate from '../helpers/paginate';
import { Collection } from 'miragejs';

export function register(server, ctx) {
	server.get('/activity', (schema, request) => {
		let model = schema.activities.all();
		let room = (request.queryParams.query || '').match(/Activity\.relatedTo : conversationroom\) AND \(Activity\.relatedId : ([^)\s]+)\)/);
		if (room) {
			// The activities of one thread, newest first, limited like Gaia
			let rows = model.models
				.filter((activity) => activity.relatedTo === 'conversationroom' && String(activity.relatedId) === room[1])
				.sort((a, b) => String(b.dateCreated).localeCompare(String(a.dateCreated)));
			let limit = Number(request.queryParams.limit);
			if (limit > 0) {
				rows = rows.slice(0, limit);
			}
			return new Collection('activity', rows);
		}
		let workspace = (request.queryParams.query || '').match(/Activity\.relatedTo : workspace\) AND \(Activity\.relatedId : ([^)\s]+)\)/);
		if (workspace) {
			// The activities of one workspace, newest first, paged like Gaia
			let rows = model.models
				.filter((activity) => activity.relatedTo === 'workspace' && String(activity.relatedId) === workspace[1])
				.sort((a, b) => String(b.dateCreated).localeCompare(String(a.dateCreated)));
			return paginate(new Collection('activity', rows), request.queryParams);
		}
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
