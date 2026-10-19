import { Response } from 'miragejs';
import getRequestData from '../helpers/parse-request';

/**
 * The HTTP status Gaia answers a test with, by result code.
 */
const TEST_STATUS = {
	TEST_EMAIL_SENT: 200,
	INVALID_RECIPIENT: 422,
	SMTP_AUTH_FAILED: 422,
	SMTP_CONNECTION_FAILED: 502,
	UNKNOWN_ERROR: 502
};

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

	/**
	 * Test mode: answers with `server.testSettingsResult` (default TEST_EMAIL_SENT)
	 * and saves nothing. The last request body is kept in `server.lastSettingsTest`.
	 */
	server.patch('/setting', (schema, request) => {
		let body = JSON.parse(request.requestBody);
		let code = server.testSettingsResult || 'TEST_EMAIL_SENT';

		server.lastSettingsTest = body;
		return new Response(TEST_STATUS[code] || 502, {}, { testResult: code });
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
