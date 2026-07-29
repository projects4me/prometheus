import ApplicationSerializer from './application';
import { JSONAPISerializer } from 'ember-cli-mirage';

export default ApplicationSerializer.extend({
	serialize(object, request) {
		let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);
		json = this.addMetaData(object, request, json);
		_.set(
			json,
			'meta.count',
			_.isArray(json.data) ? json.data.length : '1'
		);

		return json;
	}
});
