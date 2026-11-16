import { Response } from 'miragejs';
import ENV from 'prometheus/config/environment';

/**
 * Gaia's bulk resource (POST /api/v1/bulk, gaia/docs/architecture/bulk/decisions.md) on Mirage.
 *
 * Each GET item is answered by the Mirage handler registered for its URL, so a batch returns the same
 * data the separate calls would. Like Gaia, a malformed or oversized batch is refused with a 400 and an
 * item whose URL no handler serves comes back with its own 404. Only GET items are supported (the
 * client sends reads only); a batch with any other method is refused with a 400.
 *
 * @param {Object} server The Mirage server
 */
export function register(server) {
    server.post('/bulk', async (schema, request) => {
        let requests = JSON.parse(request.requestBody || '{}').requests;
        let limit = ENV.APP.bulkMaxRequests;

        // like Gaia, an invalid batch is refused as a whole (only GET items are supported here)
        if (!Array.isArray(requests) || requests.length === 0 || requests.length > limit
            || requests.some((item) => item.method !== 'GET')) {
            return new Response(400, {}, { error: 'Invalid bulk request' });
        }

        let responses = [];

        // Gaia runs the calls one at a time, in order
        for (let item of requests) {
            responses.push(await respond(server, request, item));
        }

        return { responses };
    });
}

/**
 * Runs one item through the handler Mirage registered for its URL.
 *
 * @param {Object} server The Mirage server
 * @param {Object} outer The bulk request (its Authorization header is reused)
 * @param {Object} item The bulk item { id, method, url }
 * @return {Promise<Object>} { id, status, body, durationMs }
 */
async function respond(server, outer, item) {
    let url = `${ENV.api.host}${item.url}`;
    let request = {
        method: item.method,
        url,
        requestHeaders: outer.requestHeaders,
        requestBody: null
    };
    // pretender's route lookup; it fills request.params and request.queryParams
    let match = server.pretender._handlerFor('GET', url, request);

    if (!match) {
        return { id: item.id, status: 404, body: { error: 'Not Found' }, durationMs: 0 };
    }

    let [status, , body] = await match.handler(request);

    return { id: item.id, status, body: typeof body === 'string' && body ? JSON.parse(body) : (body || null), durationMs: 0 };
}
