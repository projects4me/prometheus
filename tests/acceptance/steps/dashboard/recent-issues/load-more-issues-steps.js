import steps from '../../steps';
import { click, find, findAll } from '@ember/test-helpers';

export const when = function () {
	return [
		{
			'User clicks on load more button in recent issues widget': (
				assert,
				ctx
			) =>
				async function () {
					const loadMoreButton = find(
						'[data-recent-issues-table] [data-load-more-button]'
					);
					if (loadMoreButton) {
						await click(loadMoreButton);
						assert.ok(
							true,
							'User clicked on load more button in recent issues widget'
						);
					} else {
						assert.ok(
							false,
							'Load more button not found in recent issues widget'
						);
					}
				}
		},
		{
			'User clicks on load more button in recent issues widget again': (
				assert,
				ctx
			) =>
				async function () {
					const loadMoreButton = find(
						'[data-recent-issues-table] [data-load-more-button]'
					);
					if (loadMoreButton) {
						await click(loadMoreButton);
						assert.ok(
							true,
							'User clicked on load more button in recent issues widget again'
						);
					} else {
						assert.ok(
							false,
							'Load more button not found in recent issues widget'
						);
					}
				}
		}
	];
};

export const then = function () {
	return [
		{
			'There should be $expectedCount issues displayed in recent issues widget':
				(assert, ctx) =>
					async function (expectedCount) {
						const issueRows = findAll(
							'[data-recent-issues-table] tbody tr'
						);
						assert.equal(
							issueRows.length,
							parseInt(expectedCount),
							`${expectedCount} issues should be displayed in recent issues widget`
						);
					}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
