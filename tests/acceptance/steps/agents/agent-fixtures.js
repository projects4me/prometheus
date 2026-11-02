/* global server */

/**
 * Creates an agent with its user, and a sponsor user when one is named.
 *
 * @param {String} name the agent's name
 * @param {String} [sponsorName] the name of the sponsor
 * @param {Object} modelConfig the models by complexity
 * @returns {Object} the agent
 */
export function createAgent(name, sponsorName, modelConfig) {
	let user = server.create('user', { type: 'agent', accountStatus: 'active' });
	user.update({ name });
	let sponsor = sponsorName ? server.create('user') : null;
	sponsor?.update({ name: sponsorName });

	server.create('useridentity', { userId: user.id, provider: 'github', handle: 'agent-handle' });

	return server.create('agent', { name, userId: user.id, user, sponsor, sponsorId: sponsor?.id, modelConfig });
}

/**
 * Adds the steps that arrange agents to a steps library.
 *
 * @param {Object} library the yadda steps library
 * @returns {Object} the library
 */
export default function agentFixtureSteps(library) {
	return library
		.given('Agent "$name" runs for "$sponsor" with models "$simple" and "$complex"', async function (name, sponsor, simple, complex) {
			createAgent(name, sponsor, { simple, complex });
		})
		.given('Agent "$name" has no sponsor and the model "$simple"', async function (name, simple) {
			createAgent(name, null, { simple });
		});
}
