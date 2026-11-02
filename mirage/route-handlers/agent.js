/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import applyQuery from '../helpers/apply-query';
import getRequestData from '../helpers/parse-request';
import limitModel from '../helpers/limit-model';

/**
 * Agents as Gaia serves them: an agent row tied to a users row of type agent. A new agent creates its user from
 * the `email` and `accountStatus` of the payload, as Gaia's AgentController does.
 *
 * @param {Object} server the Mirage server
 */
export function register(server) {
	server.get('/agent', (schema, request) => {
		let agents = applyQuery(schema.agents.all(), request);

		return limitModel(request.queryParams.limit, agents, request.queryParams.page);
	});

	server.get('/agent/:id', (schema, request) => schema.agents.find(request.params.id));

	server.post('/agent', (schema, request) => {
		let { attributes } = getRequestData(request);
		let { email, accountStatus, ...agentAttributes } = attributes;
		let user = schema.users.create({
			name: agentAttributes.name,
			email,
			accountStatus: accountStatus || 'active',
			type: 'agent'
		});
		let sponsor = agentAttributes.sponsorId ? schema.users.find(agentAttributes.sponsorId) : null;

		return schema.agents.create({ ...agentAttributes, userId: user.id, user, sponsor });
	});

	server.patch('/agent/:id', (schema, request) => {
		let { attributes } = getRequestData(request);
		let { email, accountStatus, ...agentAttributes } = attributes; // eslint-disable-line no-unused-vars
		let agent = schema.agents.find(request.params.id);

		agent.update(agentAttributes);
		if (agentAttributes.sponsorId !== undefined) {
			agent.update({ sponsor: agentAttributes.sponsorId ? schema.users.find(agentAttributes.sponsorId) : null });
		}

		return agent;
	});

	server.delete('/agent/:id', (schema, request) => {
		let agent = schema.agents.find(request.params.id);

		schema.users.find(agent.userId)?.destroy();
		agent.destroy();

		return agent;
	});
}
