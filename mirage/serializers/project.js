import ApplicationSerializer from './application';
import { JSONAPISerializer } from 'ember-cli-mirage';

export default ApplicationSerializer.extend({
	serialize(object, request) {
		let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);
		if (json.included) {
			json.included = json.included.map((item) => {
				/**
				 * Adding userId into membership model because mirage treat userId as relationship(user).
				 * so setting membership.userId while creating membership model using mirage it takes it
				 * as user relationship so we didn't get userId in membership model and this causes
				 * issue while rendering role for the member in the project.
				 */
				if (item.type === 'membership') {
					item.attributes.userId = item.attributes.modifiedUser;
				}
				return item;
			});
		}
		json = this.addMetaData(object, request, json);
		_.set(
			json,
			'meta.count',
			_.isArray(json.data) ? json.data.length : '1'
		);

		return json;
	}
});
