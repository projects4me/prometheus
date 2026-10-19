import getRequestData from '../helpers/parse-request';

/**
 * Mirrors the Gaia masking: a secure value is kept server side (storedValue),
 * the API only says whether one is set.
 */
function mask(setting) {
	if (setting.secure) {
		setting.update({ settingValue: null, isSet: Boolean(setting.storedValue) });
	}
	return setting;
}

export function register(server) {
	server.get('/setting', (schema, request) => {
		let query = request.queryParams.query || '';
		let match = query.match(/Setting\.groupName : (\w+)/);

		return match ? schema.settings.where({ groupName: match[1] }) : schema.settings.all();
	});

	server.patch('/setting/:id', (schema, request) => {
		let requestData = getRequestData(request);
		let setting = schema.settings.find(request.params.id);

		if (setting.secure) {
			setting.update({ storedValue: requestData.attributes.settingValue });
		} else {
			setting.update({ settingValue: requestData.attributes.settingValue });
		}

		return mask(setting);
	});
}
