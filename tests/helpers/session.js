/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import EmberObject from '@ember/object';
import { getContext, settled } from '@ember/test-helpers';

/**
 * The single place where the tests reach for the session. When the session
 * implementation changes, only this module changes.
 *
 * @module tests/helpers/session
 */

const TEST_AUTHENTICATOR = 'authenticator:test';

/**
 * Accepts any data, so a test signs in without a token request.
 *
 * @class TestAuthenticator
 * @private
 */
class TestAuthenticator extends EmberObject {
	authenticate(data) {
		return Promise.resolve(data);
	}

	restore(data) {
		return Promise.resolve(data);
	}

	invalidate() {
		return Promise.resolve();
	}
}

function owner() {
	return getContext().owner;
}

/**
 * The session service of the running test.
 *
 * @method currentSession
 * @return {SessionService}
 */
export function currentSession() {
	return owner().lookup('service:session');
}

/**
 * Authenticates the session with the given data, as a signed-in user would be.
 *
 * @method authenticateSession
 * @param {Object} [sessionData]
 * @return {Promise<void>}
 */
export async function authenticateSession(sessionData = {}) {
	if (!owner().hasRegistration(TEST_AUTHENTICATOR)) {
		owner().register(TEST_AUTHENTICATOR, TestAuthenticator);
	}

	await currentSession().authenticate(TEST_AUTHENTICATOR, sessionData);
	return settled();
}

/**
 * Invalidates the session when it is authenticated.
 *
 * @method invalidateSession
 * @return {Promise<void>}
 */
export async function invalidateSession() {
	const session = currentSession();

	if (session.isAuthenticated) {
		await session.invalidate();
	}

	return settled();
}
