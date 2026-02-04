import getRequestData from '../helpers/parse-request';

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
		return model;
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
