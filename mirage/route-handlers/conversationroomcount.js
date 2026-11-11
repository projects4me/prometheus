import { Collection } from 'miragejs';
import Context from '../yadda-context/context';

/**
 * Answers the read-only room counts the way Gaia's `conversationroomcount` view does: one row per requested room
 * (`Conversationroomcount.id CONTAINS 'a','b'`), counted from the seeded comments and votes of the room. Every
 * request is logged in the context as `roomCountRequests`, so steps can assert how many calls a page made.
 */
export function register(server) {
    server.get('/conversationroomcount', (schema, request) => {
        let ctx = new Context();
        let params = request.queryParams;
        ctx.set('roomCountRequests', [...(ctx.get('roomCountRequests') || []), { ...params }]);
        let match = (params.query || '').match(/Conversationroomcount\.id CONTAINS ([^)]+)/);
        let ids = match ? [...match[1].matchAll(/'([^']*)'/g)].map(found => found[1]) : [];
        let counts = schema.conversationrooms.all().filter(room => ids.includes(String(room.id))).models.map(room => {
            let comments = schema.comments.where(comment => String(comment.relatedId) === String(room.id)
                && comment.relatedTo === 'conversationrooms').models;
            return schema.conversationroomcounts.new({
                id: room.id,
                commentCount: comments.length,
                likeCount: schema.votes.where(vote => String(vote.relatedId) === String(room.id)).models.length,
                agreeCount: comments.filter(comment => comment.comment === 'I agree').length,
                disagreeCount: comments.filter(comment => comment.comment === 'I disagree').length
            });
        });
        return new Collection('conversationroomcount', counts);
    });
}
