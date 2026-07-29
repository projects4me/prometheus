import steps from '../steps';
import {
	clickTrigger,
	selectChoose
} from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const when = function () {
	return [
		{
			'User clicks on $buttonType button to $actionType member $memberId':
				(assert) =>
					async function (buttonType, actionType, memberId) {
						let memberName = `User_${memberId}`;
						let memberItem = [...document.querySelectorAll('li.member-item')]
							.find((el) => el.textContent.includes(memberName));
						assert.ok(memberItem, `Member ${memberName} should be visible before ${actionType}`);

						let deleteBtn = memberItem?.querySelector(`[data-${buttonType}-member]`);
						assert.ok(deleteBtn, `Delete control should be visible for member ${memberName}`);

						await click(deleteBtn);
						assert.ok(
							true,
							`User clicks on ${buttonType} button to ${actionType} member ${memberId}`
						);
					}
		},
		{
			'Issues of that member are assigned to User 1': (assert) =>
				async function () {
					await clickTrigger(
						'div[data-field="new-assignee"] > div.input-group.select-input'
					);
					await selectChoose(
						'div[data-field="new-assignee"] > div.input-group.select-input > div',
						'.ember-power-select-option',
						1
					);

					assert.ok(
						true,
						`Issues of that member are assigned to User 1`
					);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'User $userId is deleted from project $projectId': (assert, ctx) =>
				async function (userId, projectId) {
					let memberName = `User_${userId}`;
					let memberItem = [...document.querySelectorAll('li.member-item')]
						.find((el) => el.textContent.includes(memberName));
					assert.notOk(memberItem, `${memberName} should not appear in project members`);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
