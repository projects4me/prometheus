import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    server.post('/vote', (schema, request) => {
        let requestData = getRequestData(request);
        let vote = server.create('vote', requestData.attributes);
        let user = ctx.get('currentUser');
        vote.update(requestData.attributes);
        vote.update({
            createdUser: user.id,
            createdUserName: user.name
        });
        ctx.set('latestCreatedVote', vote);
        return vote;
    });

    server.delete('/vote/:id', (schema, request) => {
        let id = request.params.id;
        let vote = schema.votes.find(id);
        if (vote) {
            vote.destroy();
        }
        return vote;
    });
}
