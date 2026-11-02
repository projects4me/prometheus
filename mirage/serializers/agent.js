import ApplicationSerializer from './application';

/**
 * Gaia returns `userId` and `sponsorId` of an agent as attributes next to its `user` and `sponsor` relationships.
 * Mirage turns the foreign keys of the relationships into relationship data only, so they are added back.
 */
export default ApplicationSerializer.extend({
	getResourceObjectForModel(model) {
		let resource = ApplicationSerializer.prototype.getResourceObjectForModel.apply(this, arguments);

		resource.attributes = { ...resource.attributes, userId: model.userId, sponsorId: model.sponsorId };

		return resource;
	}
});
