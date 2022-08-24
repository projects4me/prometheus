import getRequestData from "../helpers/parse-request";

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
        return schema.comments.all();
    });
}