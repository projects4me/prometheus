import steps from '../steps';
import {
	clickTrigger,
	selectChoose
} from 'ember-power-select/test-support/helpers';
import { click } from '@ember/test-helpers';

export const when = function () {
	return [
		{
			'Issues of that member are assigned to User 1': (assert, ctx) =>
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
					assert.dom(`[data-member-id="${userId}"]`).doesNotExist();
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
