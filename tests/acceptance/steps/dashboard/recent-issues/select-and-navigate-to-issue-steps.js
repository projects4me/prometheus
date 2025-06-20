import steps from '../../steps';
import { click } from '@ember/test-helpers';

/**
 * Selects an issue and navigates to that selected issue from Recent Issues Widget
 */
export const when = function () {
	return [
		{
			'User clicks on $issueSubject': (assert, ctx) =>
				async function () {
					let issueEl = document.querySelector(
						'[data-recent-issues-table] tbody tr'
					);
					await click(issueEl.querySelector('a'));
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
