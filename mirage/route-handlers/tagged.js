/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Collection } from 'miragejs';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    // Like Gaia: ((Tagged.relatedTo : <type>) AND (Tagged.relatedId : <id>))
    server.get('/tagged', (schema, request) => {
        let query = request.queryParams.query || '';
        let tagged = schema.taggeds.all().models;
        let relatedTo = /Tagged\.relatedTo\s*:\s*(\S+?)\)/.exec(query);
        if (relatedTo) {
            tagged = tagged.filter((row) => String(row.relatedTo) === relatedTo[1]);
        }
        let relatedId = /Tagged\.relatedId\s*:\s*(\S+?)\)/.exec(query);
        if (relatedId) {
            tagged = tagged.filter((row) => String(row.relatedId) === relatedId[1]);
        }
        return new Collection('tagged', tagged);
    });

    server.post('/tagged', (schema, request) => {
        return schema.taggeds.create(getRequestData(request).attributes);
    });

    server.delete('/tagged/:id', (schema, request) => {
        let tagged = schema.taggeds.find(request.params.id);
        tagged?.destroy();
        return tagged;
    });
}
