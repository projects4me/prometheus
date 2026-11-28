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

    server.get('/tag/:id', (schema, request) => schema.tags.find(request.params.id));

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

    // Like Gaia: a rename must stay unique in the project; {mergeInto} moves the records to the target and deletes the tag
    server.patch('/tag/:id', (schema, request) => {
        let tag = schema.tags.find(request.params.id);
        let attributes = getRequestData(request).attributes;
        if (attributes.mergeInto !== undefined) {
            let target = schema.tags.find(attributes.mergeInto);
            if (!target) {
                return new Response(404, {}, { status: 'ERROR', messages: ['The target tag does not exist'] });
            }
            schema.taggeds.where({ tagId: String(tag.id) }).models.forEach((row) => {
                let duplicate = schema.taggeds.where({ tagId: String(target.id), relatedTo: row.relatedTo, relatedId: row.relatedId }).length;
                duplicate ? row.destroy() : row.update({ tagId: String(target.id) });
            });
            tag.destroy();
            return target;
        }
        let name = String(attributes.tag ?? '').trim().toLowerCase();
        let duplicate = schema.tags.all().models.some((other) =>
            other.id !== tag.id && String(other.projectId) === String(tag.projectId) && String(other.tag).trim().toLowerCase() === name);
        if (duplicate) {
            return new Response(422, {}, { status: 'ERROR', messages: ['The tag already exists in this project'] });
        }
        tag.update(attributes);
        return tag;
    });

    server.delete('/tag/:id', (schema, request) => {
        let tag = schema.tags.find(request.params.id);
        schema.taggeds.where({ tagId: String(request.params.id) }).destroy();
        tag?.destroy();
        return tag;
    });
}
