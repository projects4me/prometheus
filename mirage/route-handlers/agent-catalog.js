/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import applyQuery from '../helpers/apply-query';
import getRequestData from '../helpers/parse-request';

/**
 * Registers Gaia's standard CRUD for one model of the tool and skill catalogs.
 *
 * @param {Object} server the Mirage server
 * @param {String} path the REST path, such as `toolserver`
 * @param {String} collection the Mirage collection, such as `toolservers`
 * @param {Function} [beforeSave] adjusts the attributes of a write, `refresh` of a tool server for one
 */
function crud(server, path, collection, beforeSave = (attributes) => attributes) {
	server.get(`/${path}`, (schema, request) => applyQuery(schema[collection].all(), request));
	server.get(`/${path}/:id`, (schema, request) => schema[collection].find(request.params.id));
	server.post(`/${path}`, (schema, request) => schema[collection].create(beforeSave(getRequestData(request).attributes)));
	server.patch(`/${path}/:id`, (schema, request) => {
		let record = schema[collection].find(request.params.id);

		record.update(beforeSave(getRequestData(request).attributes));

		return record;
	});
	server.delete(`/${path}/:id`, (schema, request) => {
		let record = schema[collection].find(request.params.id);

		record.destroy();

		return record;
	});
}

/**
 * The tool servers, tools and their grants to agents, and the skills and their grants.
 * A PATCH of a tool server with `refresh: true` stamps the time its tools were reloaded.
 *
 * @param {Object} server the Mirage server
 */
export function register(server) {
	crud(server, 'toolserver', 'toolservers', ({ refresh, ...attributes }) => (refresh ? { ...attributes, schemaRefreshedAt: new Date().toISOString() } : attributes));
	crud(server, 'tool', 'tools');
	crud(server, 'agenttool', 'agenttools');
	crud(server, 'skill', 'skills');
	crud(server, 'agentskill', 'agentskills');
}
