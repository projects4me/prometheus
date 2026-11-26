/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Collection, Response } from 'miragejs';
import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    // Like Gaia: ((Tag.projectId : <id>) AND (Tag.tag CONTAINS '<text>')), optionally sorted by name
    server.get('/tag', (schema, request) => {
        let params = request.queryParams;
        let query = params.query || '';
        let tags = schema.tags.all().models;
        let project = /Tag\.projectId\s*:\s*(\S+?)\)/.exec(query);
        if (project) {
            tags = tags.filter((tag) => String(tag.projectId) === project[1]);
        }
        let text = /Tag\.tag CONTAINS '([^']*)'/.exec(query);
        if (text) {
            tags = tags.filter((tag) => String(tag.tag).toLowerCase().includes(text[1].toLowerCase()));
        }
        if (params.sort === 'Tag.tag') {
            let direction = params.order === 'DESC' ? -1 : 1;
            tags = [...tags].sort((a, b) => direction * String(a.tag).localeCompare(String(b.tag)));
        }
        let limit = Number(params.limit);
        if (limit > 0) {
            tags = tags.slice(0, limit);
        }
        return new Collection('tag', tags);
    });

    // Like Gaia: a tag name is unique per project, whatever its letter case
    server.post('/tag', (schema, request) => {
        let attributes = getRequestData(request).attributes;
        let name = String(attributes.tag).trim().toLowerCase();
        let duplicate = schema.tags.all().models.some((tag) =>
            String(tag.projectId) === String(attributes.projectId) && String(tag.tag).trim().toLowerCase() === name);
        if (duplicate) {
            return new Response(422, {}, { status: 'ERROR', messages: ['The tag already exists in this project'] });
        }
        return schema.tags.create(attributes);
    });
}
