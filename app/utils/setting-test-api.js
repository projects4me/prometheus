/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ENV from 'prometheus/config/environment';

/**
 * The result codes the test of the settings can answer with.
 */
export const TEST_RESULT_CODES = [
    'TEST_EMAIL_SENT',
    'INVALID_RECIPIENT',
    'SMTP_AUTH_FAILED',
    'SMTP_CONNECTION_FAILED',
    'UNKNOWN_ERROR'
];

/**
 * Sends the given setting values to the save endpoint in test mode: the server
 * sends a test email with them and stores nothing.
 *
 * @method testSettings
 * @param {Array} collection Objects of `{ id, settingValue }`
 * @param {string} recipient Address the test email is sent to
 * @param {string} accessToken
 * @return {Promise<string>} A known result code; `UNKNOWN_ERROR` for an unknown or missing code or a network failure
 */
export async function testSettings(collection, recipient, accessToken) {
    let url = `${ENV.api.host}/api/v${ENV.api.version}/setting`;

    try {
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ collection, test: true, recipient })
        });
        let payload = await response.json();
        let code = payload?.testResult;

        return TEST_RESULT_CODES.includes(code) ? code : 'UNKNOWN_ERROR';
    } catch (error) {
        return 'UNKNOWN_ERROR';
    }
}
