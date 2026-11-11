import ApplicationSerializer from './application';

/**
 * Gaia returns projectId and ownerId as attributes, but Mirage keeps them as foreign keys and leaves
 * them out of the attributes, so they are put back here.
 */
export default ApplicationSerializer.extend({
	getResourceObjectForModel(model) {
		let resource = ApplicationSerializer.prototype.getResourceObjectForModel.apply(this, arguments);
		resource.attributes = { ...resource.attributes, projectId: model.projectId, ownerId: model.ownerId };
		return resource;
	}
});
