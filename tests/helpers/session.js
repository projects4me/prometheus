/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The single place where the tests reach for the session test-support. When the
 * session implementation changes, only this module changes.
 *
 * @module tests/helpers/session
 */
export {
	authenticateSession,
	currentSession,
	invalidateSession
} from 'ember-simple-auth/test-support';
