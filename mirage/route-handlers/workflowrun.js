import getRequestData from '../helpers/parse-request';
import applyQuery from '../helpers/apply-query';

/**
 * Walks the saved graph of a workflow from its trigger, taking the first connection of each step, as the
 * simulated path Gaia answers a test run with
 *
 * @param {Object} schema
 * @param {String} workflowId
 * @return {Array} the steps in the order taken
 */
function simulate(schema, workflowId) {
	let nodes = schema.workflownodes.where({ workflowId: String(workflowId) }).models;
	let edges = schema.workflowedges.where({ workflowId: String(workflowId) }).models;
	let steps = [];
	let node = nodes.find(candidate => candidate.category === 'trigger');
	while (node && steps.length < nodes.length) {
		let edge = edges.find(candidate => String(candidate.fromNodeId) === String(node.id));
		steps.push({
			sequence: steps.length + 1,
			nodeId: String(node.id),
			category: node.category,
			kind: node.kind,
			status: node.category === 'trigger' ? 'completed' : 'simulated',
			port: edge ? edge.fromPort : null,
			inputs: { kind: node.kind },
			outputs: {},
			error: null
		});
		node = edge && nodes.find(candidate => String(candidate.id) === String(edge.toNodeId));
	}
	return steps;
}

export function register(server) {
	server.get('/workflowrun', (schema, request) => {
		// Gaia does not keep simulated runs; the mock saves them only to answer with an id
		return applyQuery(schema.workflowruns.where(run => !run.test), request);
	});

	server.post('/workflowrun', (schema, request) => {
		let attributes = getRequestData(request).attributes;
		let steps = simulate(schema, attributes.workflowId);
		return schema.workflowruns.new({
			workflowId: attributes.workflowId,
			entityId: attributes.entityId,
			test: true,
			status: 'completed',
			inputs: { id: attributes.entityId },
			steps
		}).save();
	});

	server.get('/workflowrunstep', (schema, request) => {
		return applyQuery(schema.workflowrunsteps.all(), request);
	});
}
