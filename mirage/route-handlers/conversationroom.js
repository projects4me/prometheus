import getRequestData from "../helpers/parse-request";
import Context from "../yadda-context/context";
import applyQuery from "../helpers/apply-query";
import sortByFields from "../helpers/model/sort-by-fields";

export function register(server, ctx) {
    server.get('/conversationroom', (schema, request) => {
        let ctx = new Context();
        let params = request.queryParams;
        let customCallback = ctx.get('cbConversationRoom');
        if (customCallback) {
            return customCallback(schema.conversationrooms.all());
        }
        // Let the steps assert what the browser sent.
        ctx.set('lastConversationQuery', params.query);
        ctx.set('conversationRequests', [...(ctx.get('conversationRequests') || []), { ...params }]);

        // The factory rooms carry a project shortcode, not an id, so the project condition is not applied.
        let query = (params.query || '').replace(/\(Conversationroom\.projectId : [^)]+\)/g, '');
        let rooms = applyQuery(schema.conversationrooms.all(), { queryParams: { query } });
        let contains = query.match(/Conversationroom\.(\w+) CONTAINS ([^)]+)/);
        if (contains) {
            rooms = rooms.filter(room => String(room[contains[1]] ?? '').toLowerCase().includes(contains[2].trim().toLowerCase()));
        }
        let total = rooms.length;
        let hasNext = false;
        if (params.sort) {
            rooms = sortByFields(params.sort, params.order, rooms);
        }
        let limit = Number(params.limit);
        let page = Math.max(1, Number(params.page) || 1);
        if (limit > 0) {
            rooms = rooms.slice((page - 1) * limit, page * limit);
            hasNext = total > page * limit;
        }
        // Like Gaia: no total, only meta.links.next while more rows exist after this page.
        rooms.meta = { links: hasNext ? { next: { href: `/conversationroom?page=${page + 1}` } } : {} };
        return rooms;
    });

    server.get('/conversationroom/:id', (schema, request) => {
        return schema.conversationrooms.find(request.params.id);
    });

    server.post('/conversationroom', (schema, request) => {
        let requestData = getRequestData(request);
        let conversationRoom = server.create('conversationroom', requestData.attributes);
        return conversationRoom;
    });

    server.patch('/conversationroom/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let conversationRoom = schema.conversationrooms.find(requestData.id);
        conversationRoom.update(requestData.attributes);
        return conversationRoom;
    });
}