/**
 * Mirage treats ownerId and projectId of a doc as foreign keys, so the owner and the project have to
 * exist before the doc is created, whether it comes from the factory or from a posted doc.
 *
 * @param {Server} server
 * @param {Object} attributes The doc attributes
 */
export default function ensureDocReferences(server, attributes) {
	if (attributes.ownerId && !server.schema.users.find(attributes.ownerId)) {
		server.create('user', { id: attributes.ownerId });
	}
	if (attributes.projectId && !server.schema.projects.find(attributes.projectId)) {
		server.create('project', { id: attributes.projectId });
	}
}
