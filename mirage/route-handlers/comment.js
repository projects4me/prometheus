import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';
import sortByFields from '../helpers/model/sort-by-fields';

/**
 * Answers a comment list request the way Gaia does for the queries the app sends: the `(Comment.field : value)`
 * conditions (the comments of one thread), a `(Comment.dateCreated <: date)` cursor ("at or before"), sort and
 * order, and limit with page. Like Gaia it sends no total, only `meta.links.next` while more rows follow the
 * page. Other conditions (BETWEEN) are not applied. The cursor compares the dates as text, so the seeded comments
 * and the cursor have to use one date format.
 *
 * @param {Collection} comments
 * @param {Object} request
 * @returns {Collection}
 */
function listComments(comments, request) {
	let params = request.queryParams;
	comments = applyQuery(comments, request);
	let before = (params.query || '').match(/Comment\.dateCreated <: ([^)]+)\)/);
	let cursor = before ? before[1].trim() : null;
	if (cursor && cursor !== 'undefined') {
		comments = comments.filter(comment => String(comment.dateCreated) <= cursor);
	}
	if (params.sort) {
		comments = sortByFields(params.sort, params.order, comments);
	}
	let limit = Number(params.limit);
	let page = Math.max(1, Number(params.page) || 1);
	if (limit > 0) {
		let total = comments.length;
		comments = comments.slice((page - 1) * limit, page * limit);
		comments.meta = { links: total > page * limit ? { next: { href: `/comment?page=${page + 1}` } } : {} };
	}
	return comments;
}

export function register(server, ctx) {
	server.post('/comment', (schema, request) => {
		let requestData = getRequestData(request);
		let comment = server.create('comment', requestData.attributes);
		let currentUser = ctx.get('currentUser');

		comment.update({
			createdUser: currentUser.id,
			createdUserName: currentUser.name
		});
		return comment;
	});

	server.get('/comment', (schema, request) => {
		let model = schema.comments.all();
		if (
			ctx.get('customCallback') &&
			typeof ctx.get('customCallback') === 'function'
		) {
			return ctx.get('customCallback')(model);
		}
		return listComments(model, request);
	});

	server.get('/comment/:id', (schema, request) => {
		return schema.comments.find(request.params.id);
	});

	server.patch('/comment/:id', (schema, request) => {
		let id = request.params.id;
		let requestData = getRequestData(request);
		let comment = schema.comments.find(id);
		comment.update(requestData.attributes);
		return comment;
	});
	
	server.delete('/comment/:id', (schema, request) => {
        let id = request.params.id;
        let comment = schema.comments.find(id);
        comment.destroy();
        return comment;
    });
}
