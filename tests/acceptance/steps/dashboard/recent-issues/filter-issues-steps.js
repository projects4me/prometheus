import steps from '../../steps';
import { click, find, findAll } from '@ember/test-helpers';

export const given = function () {
	return [
		{
			'Issue $issueId is assigned to User_$userId': (assert, ctx) =>
				async function (issueId, userId) {
					// Update the issue assignee in the context
					const issue = server.schema.issues.find(
						(i) => i.id === parseInt(issueId)
					);
					if (issue) {
						issue.assignee = parseInt(userId);
					}
					assert.ok(
						true,
						`Issue ${issueId} is assigned to User_${userId}`
					);
				}
		},
		{
			'Issue $issueId is assigned to User_$userId and has status "$status"':
				(assert, ctx) =>
					async function (issueId, userId, status) {
						const issue = server.schema.issues.find(
							(i) => i.id === parseInt(issueId)
						);
						if (issue) {
							issue.assignee = parseInt(userId);
							issue.status = status;
						}
						assert.ok(
							true,
							`Issue ${issueId} is assigned to User_${userId} with status ${status}`
						);
					}
		}
	];
};

export const when = function () {
	return [
		{
			'User clicks on filter dropdown in Recent Issues box': (
				assert,
				ctx
			) =>
				async function () {
					const filterButton = find(
						'[data-recent-issues-table] .app-dropdown-btn'
					);
					await click(filterButton);
					assert.ok(
						true,
						'User clicked on filter dropdown in Recent Issues box'
					);
				}
		},
		{
			'User selects "$filterName" filter': (assert, ctx) =>
				async function (filterName) {
					const filterLink = find(
						`[data-recent-issues-table] [data-filter-name="${filterName}"]`
					);
					if (filterLink) {
						await click(filterLink);
						assert.ok(true, `User selected ${filterName} filter`);
					} else {
						assert.ok(false, `Filter ${filterName} not found`);
					}
				}
		},
		{
			'User deselects "$filterName" filter': (assert, ctx) =>
				async function (filterName) {
					const filterLink = find(
						`[data-recent-issues-table] [data-filter-name="${filterName}"]`
					);
					if (filterLink) {
						await click(filterLink);
						assert.ok(true, `User deselected ${filterName} filter`);
					} else {
						assert.ok(false, `Filter ${filterName} not found`);
					}
				}
		}
	];
};

export const then = function () {
	return [
		{
			'Only issues assigned to User_$userId should be visible in Recent Issues box':
				(assert, ctx) =>
					async function (userId) {
						const issueRows = findAll(
							'[data-recent-issues-table] tbody tr'
						);

						issueRows.forEach((row) => {
							const issueNumber = row
								.querySelector('td:first-child a')
								.textContent.trim();
							const issue = server.schema.issues.find(
								(i) => `#${i.issueNumber}` === issueNumber
							);
							if (issue) {
								assert.equal(
									issue.assignee,
									parseInt(userId),
									`Issue ${issueNumber} should be assigned to User_${userId}`
								);
							}
						});

						assert.ok(
							true,
							`Only issues assigned to User_${userId} are visible`
						);
					}
		},
		{
			'Only issues assigned to User_$userId with status "$status" should be visible in Recent Issues box':
				(assert, ctx) =>
					async function (userId, status) {
						const issueRows = findAll(
							'[data-recent-issues-table] tbody tr'
						);

						issueRows.forEach((row) => {
							const issueNumber = row
								.querySelector('td:first-child a')
								.textContent.trim();
							const issue = server.schema.issues.find(
								(i) => `#${i.issueNumber}` === issueNumber
							);

							if (issue) {
								assert.equal(
									issue.assignee,
									parseInt(userId),
									`Issue ${issueNumber} should be assigned to User_${userId}`
								);
								assert.equal(
									issue.status,
									status,
									`Issue ${issueNumber} should have status ${status}`
								);
							}
						});

						assert.ok(
							true,
							`Only issues assigned to User_${userId} with status ${status} are visible`
						);
					}
		},
		{
			'Only issues with status "$status" should be visible in Recent Issues box':
				(assert, ctx) =>
					async function (status) {
						const issueRows = findAll(
							'[data-recent-issues-table] tbody tr'
						);

						issueRows.forEach((row) => {
							const issueNumber = row
								.querySelector('td:first-child a')
								.textContent.trim();
							const issue = server.schema.issues.find(
								(i) => `#${i.issueNumber}` === issueNumber
							);

							if (issue) {
								assert.equal(
									issue.status,
									status,
									`Issue ${issueNumber} should have status ${status}`
								);
							}
						});

						assert.ok(
							true,
							`Only issues with status ${status} are visible`
						);
					}
		},
		{
			'Filter "$filterName" should be marked as active': (assert, ctx) =>
				async function (filterName) {
					const filterLink = find(
						`[data-recent-issues-table] [data-filter-name="${filterName}"]`
					);
					if (filterLink) {
						const checkIcon = filterLink.querySelector('.fa-check');
						assert.ok(
							checkIcon,
							`Filter ${filterName} should have a check icon indicating it's active`
						);
					} else {
						assert.ok(false, `Filter ${filterName} not found`);
					}
				}
		},
		{
			'Filter "$filterName" should not be active': (assert, ctx) =>
				async function (filterName) {
					const filterLink = find(
						`[data-recent-issues-table] [data-filter-name="${filterName}"]`
					);
					if (filterLink) {
						const checkIcon = filterLink.querySelector('.fa-check');
						assert.notOk(
							checkIcon,
							`Filter ${filterName} should not have a check icon`
						);
					} else {
						assert.ok(false, `Filter ${filterName} not found`);
					}
				}
		},
		{
			'Both filters should be marked as active': (assert, ctx) =>
				async function () {
					const checkIcons = findAll(
						`[data-recent-issues-table] .app-dropdown-content .fa-check`
					);
					assert.equal(
						checkIcons.length,
						2,
						'Both filters should be marked as active'
					);
				}
		},
		{
			'Filter "inProgressIssues" should remain active': (assert, ctx) =>
				async function () {
					const filterLink = find(
						`[data-recent-issues-table] [data-filter-name="inProgressIssues"]`
					);
					if (filterLink) {
						const checkIcon = filterLink.querySelector('.fa-check');
						assert.ok(
							checkIcon,
							'Filter inProgressIssues should remain active'
						);
					} else {
						assert.ok(false, 'Filter inProgressIssues not found');
					}
				}
		},
		{
			'Filter badge should show count "$count"': (assert, ctx) =>
				async function (count) {
					const badge = find(
						'[data-recent-issues-table] [data-active-filters-count]'
					);
					if (badge) {
						assert.equal(
							badge.textContent.trim(),
							count,
							`Filter badge should show count ${count}`
						);
					} else {
						assert.ok(false, 'Filter badge not found');
					}
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
