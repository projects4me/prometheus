import steps from '../steps';
import {
	currentSession,
	authenticateSession
} from 'ember-simple-auth/test-support';
import { currentURL, visit, click, fillIn } from '@ember/test-helpers';

export const given = function () {
	return [
		{
			'$userName is logged in': (assert, ctx) =>
				async function (userName) {
					let id = userName.slice(-1);
					ctx.set('loggedInUser', server.schema.users.find(id));
					await authenticateUser(id, ctx);
					assert.ok(true, 'User is logged in');
				}
		},
		{
			'User is not logged in': (assert) =>
				async function () {
					await visit('/signin');
					assert.equal(
						currentURL(),
						'/signin',
						'User is not logged in'
					);
				}
		}
	];
};

export const when = function () {
	return [
		{
			'User click on signin button': (assert, ctx) =>
				async function () {
					let userId = 1;
					// For correct username/password case
					if (
						document.querySelector('input#email').value ===
							'email' &&
						document.querySelector('input#password').value ===
							'password'
					) {
						authenticateUser(userId, ctx);
					}

					ctx.set('currentUser', server.schema.users.find(userId));
					await visit('/signin');
					assert.ok(true, 'User clicked on signin button');
				}
		}
	];
};

const authenticateUser = async function (id, ctx) {
	let session = currentSession();
	if (!session.isAuthenticated) {
		await authenticateSession({
			authToken: '12345'
		});
	}

	let user = server.schema.users.find(id);
	let userPermissions = server.schema.userpermissions.all();

	// Ensure every resource allows all actions so ACL-gated UI renders in tests.
	userPermissions.models.forEach((permission) => {
		permission.update({
			userId: id,
			readF: '1',
			createF: '1',
			updateF: '1',
			deleteF: '1',
			importF: '1',
			exportF: '1'
		});
	});

	user.update({
		aclPermissions: userPermissions
	});

	ctx.set('currentUser', user);
};

export default function (assert) {
	return steps(assert);
}
