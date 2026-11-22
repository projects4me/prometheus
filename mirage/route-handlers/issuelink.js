/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Response } from 'miragejs';
import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

/**
 * Issue links. GET filters on the `(Issuelink.field : value)` conditions of the query (sourceIssueId,
 * targetIssueId, type, projectId) and honours `limit`.
 */
export function register(server, ctx) {
    server.get('/issuelink', (schema, request) => {
        let links = applyQuery(schema.issuelinks.all(), request);
        let limit = parseInt(request.queryParams.limit, 10);
        if (limit > 0) {
            links = schema.issuelinks.find(links.models.slice(0, limit).map((link) => link.id));
        }
        if (ctx.get('customCallback')) {
            return ctx.get('customCallback')(links, request);
        }
        return links;
    });

    server.post('/issuelink', (schema, request) => {
        let requestData = getRequestData(request);
        return server.create('issuelink', requestData.attributes);
    });

    server.delete('/issuelink/:id', (schema, request) => {
        let link = schema.issuelinks.find(request.params.id);
        if (!link) {
            return new Response(404, {}, { error: 'Issuelink not found' });
        }
        link.destroy();
        return new Response(204);
    });
}
