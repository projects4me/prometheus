/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Collection } from 'miragejs';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    // Like Gaia: ((Tagged.relatedTo : <type>) AND (Tagged.relatedId : <id>))
    server.get('/tagged', function (schema, request) {
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
        let tagId = /Tagged\.tagId\s*:\s*(\S+?)\)/.exec(query);
        if (tagId) {
            tagged = tagged.filter((row) => String(row.tagId) === tagId[1]);
        }
        let relatedIds = /Tagged\.relatedId CONTAINS ([^)]+)\)/.exec(query);
        if (relatedIds) {
            let wanted = [...relatedIds[1].matchAll(/'([^']*)'/g)].map((found) => found[1]);
            tagged = tagged.filter((row) => wanted.includes(String(row.relatedId)));
        }
        let total = tagged.length;
        let limit = Number(request.queryParams.limit);
        if (limit > 0) {
            tagged = tagged.slice(0, limit);
        }
        let json = this.serialize(new Collection('tagged', tagged));
        // Like Gaia, a count query tells the total of all matching rows, not of the page
        if (tagId) {
            json.meta = { ...json.meta, total };
        }
        return json;
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
