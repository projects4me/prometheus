import steps from '../steps';
import { click, find, findAll } from '@ember/test-helpers';
import DateUtils from 'prometheus/utils/date';
import Collection from 'ember-cli-mirage/orm/collection';
import Context from '../../../../mirage/yadda-context/context';

const ctx = new Context();
export const selectors = {
	'recent issues': {
		selector: '[data-recent-issues-table]',
		handler: tableHandler,
		noContent: {
			message: 'No issues found'
		}
	},
	'active milestones': {
		selector: '[data-active-milestones-table]',
		handler: tableHandler,
		noContent: {
			message: 'No milestones found'
		}
	},
	'weekly activities': {
		selector: '[data-weekly-activities]',
		handler: (assert, ctx, expectedCount) => {
			assert.dom('[data-weekly-activities] .timeline-item').exists({
				count: parseInt(expectedCount)
			});
		},
		noContent: {
			message: 'No activities found'
		}
	},
	'weekly timelogs': {
		selector: '[data-weekly-timelogs]',
		handler: (assert, ctx, expectedCount, modelType, widget) => {
			const rows = findAll(`${selectors[widget].selector} tbody tr`);
			assert.equal(
				rows.length,
				parseInt(expectedCount),
				`${expectedCount} timelogs should be present in weekly timelogs widget`
			);
		},
		noContent: {
			message: 'No timelogs found'
		}
	},
	'weekly conversations': {
		selector: '[data-recent-conversations]',
		handler: (assert, ctx, expectedCount, modelType, widget) => {
			assert.equal(
				findAll(
					`${selectors[widget].selector} [data-accordion-section]`
				).length,
				parseInt(expectedCount)
			);
		},
		noContent: {
			message: 'No conversations found for this week'
		}
	}
};

export const given = function () {
	return [
		{
			'There is 1 issue for $type week': (assert, ctx) =>
				async function (type) {
					createIssue(1, type);
					assert.ok(true, `There is 1 issue for ${type} week`);
				}
		},
		{
			'There is another issue for $type week': (assert, ctx) =>
				async function (type) {
					createIssue(2, type);
					assert.ok(true, `There is another issue for ${type} week`);
				}
		}
	];
};

export const when = function () {
	return [
		{
			'User clicks on load more button in $widget widget': (
				assert,
				ctx
			) =>
				async function (widget) {
					const loadMoreButton = find(
						`${selectors[widget].selector} [data-load-more-button]`
					);
					if (loadMoreButton) {
						await click(loadMoreButton);
						assert.ok(
							true,
							`User clicked on load more button in ${widget}`
						);
					} else {
						assert.ok(
							false,
							`Load more button not found in ${widget}`
						);
					}
				}
		},
		{
			'User clicks on load more button in $widget widget again': (
				assert,
				ctx
			) =>
				async function (widget) {
					const loadMoreButton = find(
						`${selectors[widget].selector} [data-load-more-button]`
					);
					if (loadMoreButton) {
						await click(loadMoreButton);
						assert.ok(
							true,
							`User clicked on load more button in ${widget} again`
						);
					} else {
						assert.ok(
							false,
							`Load more button not found in ${widget}`
						);
					}
				}
		}
	];
};

export const then = function () {
	return [
		{
			'There should be $expectedCount $modelType present in $widget widget':
				(assert, ctx) =>
					async function (expectedCount, modelType, widget) {
						selectors[widget].handler(
							assert,
							ctx,
							expectedCount,
							modelType,
							widget
						);
					}
		},
		{
			'There should be no $modelType present in $widget widget': (
				assert,
				ctx
			) =>
				async function (modelType, widget) {
					assert
						.dom(
							`${selectors[widget].selector} .no-content .description`
						)
						.hasText(selectors[widget].noContent.message);
				}
		}
	];
};

function tableHandler(assert, ctx, expectedCount, modelType, widget) {
	const rows = findAll(`${selectors[widget].selector} tbody tr`);
	assert.equal(
		rows.length,
		parseInt(expectedCount),
		`${expectedCount} ${modelType} should be present in ${widget}`
	);
}

export function filterWeeklyWidgetModel(modelType, collection) {
	if (!ctx.get('page')) {
		ctx.set('page', 1);
	}
	let { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(
		ctx.get('page')
	);
	let models = collection.models.filter(
		(model) =>
			model.dateCreated >= startOfWeek && model.dateCreated <= endOfWeek
	);
	return new Collection(modelType, models);
}

export function setDateForWeeklyWidget(collection, count, week) {
	let models = collection.models;
	if (week === 'this') {
		let date = DateUtils.getWeekRangeForPage(1);
		for (let i = 0; i < count; i++) {
			models[i].update({
				dateCreated: date.startOfWeek
			});
		}
		ctx.set('lastSetCount', count);
	} else if (week === 'previous') {
		let date = DateUtils.getWeekRangeForPage(2);
		for (let i = ctx.get('lastSetCount'); i < models.length; i++) {
			models[i].update({
				dateCreated: date.startOfWeek
			});
		}
	}
}

function createIssue(issueNumber, type) {
	let project = server.schema.projects.find(2);
	let context = new Context();
	let issue = server.schema.create('issue', {
		projectId: project.id,
		projectShortcode: project.shortCode,
		startDate: DateUtils.getWeekRangeForPage(1).startOfWeek,
		endDate: DateUtils.getWeekRangeForPage(1).endOfWeek,
		issueNumber: issueNumber,
		subject: `test issue ${issueNumber}`,
		description: `test description ${issueNumber}`,
		status: 'Open',
		issueTypeId: 1
	});
	if (type === 'previous') {
		issue.update({
			startDate: DateUtils.getWeekRangeForPage(2).startOfWeek,
			endDate: DateUtils.getWeekRangeForPage(2).endOfWeek
		});
	}

	context.set('currentIssue', issue);
}

export default function (assert) {
	return steps(assert);
}
