/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import getRequestData from '../helpers/parse-request';
import getValueFromQuery from '../helpers/get-value-from-query';

/**
 * Agent credentials as Gaia serves them: creating one issues a new secret, returned once as `clientSecret`, and
 * replaces the agent's previous credential.
 *
 * @param {Object} server the Mirage server
 */
export function register(server) {
	server.get('/agentcredential', (schema, request) => {
		let agentId = getValueFromQuery('Agentcredential.agentId', request.queryParams.query);

		return agentId ? schema.agentcredentials.where({ agentId: agentId.trim() }) : schema.agentcredentials.all();
	});

	server.post('/agentcredential', (schema, request) => {
		let { attributes } = getRequestData(request);

		schema.agentcredentials.where({ agentId: attributes.agentId }).destroy();

		let suffix = Math.random().toString(16).slice(2, 12);
		let credential = schema.agentcredentials.create({
			agentId: attributes.agentId,
			clientId: `agent-${attributes.agentId}`,
			createdUserName: 'User One',
			dateCreated: new Date().toISOString().slice(0, 19).replace('T', ' ')
		});

		return { data: { type: 'agentcredential', id: credential.id, attributes: { ...credential.attrs, id: undefined, clientSecret: `p4m_cs_${suffix}` } } };
	});

	server.delete('/agentcredential/:id', (schema, request) => {
		let credential = schema.agentcredentials.find(request.params.id);

		credential.destroy();

		return credential;
	});
}
