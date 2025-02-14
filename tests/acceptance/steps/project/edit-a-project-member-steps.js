import steps from '../steps';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const given = function () {
	return [
		{
			'$userName is given role $roleId in Project $projectId': (
				assert,
				ctx
			) =>
				async function (userName, roleId, projectId) {
					let userId = server.schema.users.findBy({
						name: userName
					}).id;
					server.create('membership', {
						project: server.schema.projects.find(projectId),
						roleId: roleId,
						modifiedUser: userId
					});
				}
		}
	];
};

export const when = function () {
	return [
		{
			'User clicks on edit button to edit member $memberId': (
				assert,
				ctx
			) =>
				async function (memberId) {
					await click(
						`[data-member-id="${memberId}"] [data-edit-member]`
					);
					assert.ok(
						true,
						`User clicks on edit button to edit member ${memberId}`
					);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'User $userId membership is updated with role $roleId': (
				assert,
				ctx
			) =>
				async function (userId, roleId) {
					let role = server.schema.roles.find(roleId);
					assert
						.dom(`[data-member-id="${userId}"] [data-member-role]`)
						.hasText(role.name);
					assert.ok(
						true,
						`User ${userId} membership is updated with ${roleId}`
					);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
