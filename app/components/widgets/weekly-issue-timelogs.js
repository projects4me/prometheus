/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import DateUtils from 'prometheus/utils/date';
import { cached } from '@glimmer/tracking';

/**
 * A widget component that displays weekly timelogs grouped by issue.
 * Provides filtering, searching, and pagination by week, and calculates total spent and estimated time.
 *
 * @class WidgetsWeeklyIssueTimelogsComponent
 * @namespace Prometheus.Components.Widgets
 * @module Widgets.WeeklyIssueTimelogs
 * @extends WidgetsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <Widgets::WeeklyIssueTimelogs
 *   @data={{this.timelogs}}
 *   @widgetSettings={{this.widgetSettings}}
 *   @currentUser={{this.currentUser}}
 * />
 */
export default class WidgetsWeeklyIssueTimelogsComponent extends WidgetsComponent {
	/**
	 * The original timelog data to display, provided via the component's arguments.
	 * @property data
	 * @type {Array}
	 * @public
	 */
	@tracked data = this.args.data || [];

	/**
	 * The filtered timelog data, updated by search and filters.
	 * @property filteredData
	 * @type {Array}
	 * @public
	 */
	@tracked filteredData = this.args.data || [];

	/**
	 * The current search query entered by the user.
	 * @property query
	 * @type {String}
	 * @public
	 */
	@tracked query = '';

	/**
	 * The list of project shortcodes present in the current timelogs.
	 * Used for dynamic project-based filtering.
	 * @property projects
	 * @type {Array}
	 * @public
	 */
	@tracked projects = [];

	/**
	 * The start date of the currently selected week.
	 * @property startWeek
	 * @type {String|Date}
	 * @public
	 */
	@tracked startWeek = DateUtils.getWeekRangeForPage(1).startOfWeek;

	/**
	 * The end date of the currently selected week.
	 * @property endWeek
	 * @type {String|Date}
	 * @public
	 */
	@tracked endWeek = DateUtils.getWeekRangeForPage(1).endOfWeek;

	/**
	 * Queries the store for issues (timelogs) within the given week range.
	 * Single source of truth for the timelog fetch used by both
	 * onPaginate and refresh.
	 *
	 * @method fetchTimelogs
	 * @param {String} startWeek - Start of the week range
	 * @param {String} endWeek - End of the week range
	 * @returns {Promise<Array>}
	 * @private
	 */
	async fetchTimelogs(startWeek, endWeek) {
		let { limit = -1, rels = 'spent,estimated', sort = 'Issue.dateModified', order = 'DESC' } = this.baseOptions();
		return await this.store.query('issue', {
			query: `(Issue.startDate <: ${endWeek}) AND (Issue.endDate >: ${startWeek})`,
			limit,
			rels,
			sort,
			order
		});
	}

	/**
	 * Handles pagination changes, fetching timelogs for the selected week.
	 *
	 * @method onPaginate
	 * @param {Object} paginationInfo - Contains the page number (week index)
	 * @public
	 * @action
	 * @returns {Promise<void>}
	 */
	@action
	async onPaginate(paginationInfo = {}) {
		const { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(
			paginationInfo.page
		);
		this.startWeek = startOfWeek;
		this.endWeek = endOfWeek;
		const data = await this.fetchTimelogs(this.startWeek, this.endWeek);
		this.data = data;
		this.filteredData = data;
	}

	/**
	 * Refreshes the widget by re-fetching timelogs for the currently displayed
	 * week using the same query as onPaginate.
	 *
	 * @method refresh
	 * @public
	 * @action
	 */
	@action
	async refresh() {
		const data = await this.fetchTimelogs(this.startWeek, this.endWeek);
		this.data = data;
		this.filteredData = data;
	}

	/**
	 * Groups timelogs by issue number, accumulating time spent and estimated per context.
	 * Also collects project shortcodes for filtering.
	 *
	 * @property timelogsByIssueNumber
	 * @type {Array}
	 * @public
	 */
	@cached
	get timelogsByIssueNumber() {
		let data = this.filteredData;
		let timelogs = [];
		let timelogKeys = {};
		let projects = [];

		const addOrUpdateTimelog = (issue, context, formattedTime) => {
			if (timelogKeys[issue.issueNumber] !== undefined) {
				let tl = timelogs[timelogKeys[issue.issueNumber]];
				if (tl.timelogContext[context]) {
					tl.timelogContext[context].hours += formattedTime.hours;
					tl.timelogContext[context].minutes += formattedTime.minutes;

					// normalize minutes
					let minutes = tl.timelogContext[context].minutes;
					let normalizedMinutesWithHrs = DateUtils.normalizeMinutes(minutes);
					tl.timelogContext[context].hours += normalizedMinutesWithHrs.hours;
					tl.timelogContext[context].minutes = normalizedMinutesWithHrs.minutes;
				} else {
					tl.timelogContext[context] = formattedTime;
				}
			} else {
				timelogs.push({
					issueNumber: issue.issueNumber,
					issueSubject: issue.subject,
					issueStatus: issue.status,
					timelogContext: { [context]: formattedTime },
					projectShortcode: issue.projectShortcode
				});
				timelogKeys[issue.issueNumber] = timelogs.length - 1;
			}
		};

		data?.forEach((issue) => {
			['spent', 'estimated'].forEach((context) => {
				if (issue[context].length > 0) {
					issue[context].forEach((timelog) => {
						let daysToHours = timelog.days * 8;
						let hours =
							parseInt(timelog.hours, 10) +
							parseInt(daysToHours, 10);

						let hrsAndMinutes = {
							hours: hours,
							minutes: parseInt(timelog.minutes, 10)
						}
						addOrUpdateTimelog(
							issue,
							timelog.context,
							hrsAndMinutes
						);
					});
				} else {
					addOrUpdateTimelog(issue, context, {
						hours: 0,
						minutes: 0
					});
				}
			});
		});

		next(this, () => {
			this.projects = projects;
		});
		return timelogs;
	}

	/**
	 * Returns the list of available filters, including dynamic project filters.
	 *
	 * @property filters
	 * @type {Array}
	 * @public
	 */
	get filters() {
		let filters = this.args.widgetSettings.filters || [];
		if (filters.length === 0) {
			return [];
		}
		filters = filters.map((filter) => {
			return {
				name: filter,
				label: this.intl.t(
					`views.app.widgets.weeklyIssueTimelogs.filters.${filter}`
				)
			};
		});

		// add projects to the filters
		if (this.projects.length > 0) {
			this.projects.forEach((project) => {
				filters.push({
					name: project,
					label: project
				});
			});
		}
		return filters;
	}

	/**
	 * The filter callbacks for the widget, including dynamic project filters.
	 * @property filterCallbacks
	 * @type {Object}
	 * @public
	 */
	get filterCallbacks() {
		let cb = {
			myTimeLogs: this.filterMyTimeLogs
		};
		if (this.projects.length > 0) {
			this.projects.forEach((project) => {
				cb[project] = (data) => {
					return data.filter((timelog) => {
						return timelog.projectShortcode === project;
					});
				};
			});
		}
		return cb;
	}

	/**
	 * Filters timelogs to only those created by the current user.
	 *
	 * @method filterMyTimeLogs
	 * @param {Array} data - The timelog data to filter
	 * @returns {Array}
	 * @public
	 * @action
	 */
	@action
	filterMyTimeLogs(issues) {
		issues = this.filterTimelogsByContext(issues, 'spent');
		issues = this.filterTimelogsByContext(issues, 'estimated');
		return issues;
	}

	/**
	 * Formats a float value of hours into an object with hours and minutes.
	 *
	 * @method formatHoursFloat
	 * @param {Number} floatHours
	 * @returns {Object} - { hours, minutes }
	 * @public
	 * @action
	 */
	@action formatHoursFloat(floatHours) {
		const hours = Math.floor(floatHours);
		const minutes = Math.round((floatHours - hours) * 60);
		return {
			hours: hours,
			minutes: minutes
		};
	}

	/**
	 * Handles the search functionality for the weekly timelogs table.
	 * Updates the filteredData property with the filtered results from the table component.
	 *
	 * @method handleSearch
	 * @param {string} query - The search query
	 * @param {Array} filteredDataByTableComponent - The filtered data from the table component
	 * @public
	 * @action
	 */
	@action
	handleSearch(query, filteredDataByTableComponent) {
		this.query = query;
		this.filteredData = filteredDataByTableComponent;
	}

	/**
	 * Returns the appropriate empty state message based on the search query.
	 *
	 * @property timelogEmptyStateMessage
	 * @type {String}
	 * @public
	 */
	get timelogEmptyStateMessage() {
		return this.intl.t(
			this.query?.length > 0
				? 'views.app.widgets.weeklyIssueTimelogs.noTimelogsFound'
				: 'views.app.widgets.weeklyIssueTimelogs.emptyStateMessage'
		);
	}

	/**
	 * Updates the filteredData property with the provided data.
	 *
	 * @method setData
	 * @param {Array} data
	 * @public
	 * @action
	 */
	@action
	setData(data) {
		this.filteredData = data;
	}

	/**
	 * The total spent time (hours and minutes) for the current week.
	 *
	 * @property totalSpentTime
	 * @type {Object}
	 * @public
	 */
	get totalSpentTime() {
		let hours = this.getAccumulatedTime(
			this.timelogsByIssueNumber,
			'spent',
			'hours'
		);
		let minutes = this.getAccumulatedTime(
			this.timelogsByIssueNumber,
			'spent',
			'minutes'
		);
		
		// Normalize minutes to ensure they don't exceed 60
		const normalized = DateUtils.normalizeMinutes(minutes);
		hours += normalized.hours;
		minutes = normalized.minutes;
		
		return {
			hours: hours,
			minutes: minutes
		};
	}

	/**
	 * The total estimated time (hours and minutes) for the current week.
	 *
	 * @property totalEstimatedTime
	 * @type {Object}
	 * @public
	 */
	get totalEstimatedTime() {
		let hours = this.getAccumulatedTime(
			this.timelogsByIssueNumber,
			'est',
			'hours'
		);
		let minutes = this.getAccumulatedTime(
			this.timelogsByIssueNumber,
			'est',
			'minutes'
		);
		
		// Normalize minutes to ensure they don't exceed 60
		const normalized = DateUtils.normalizeMinutes(minutes);
		hours += normalized.hours;
		minutes = normalized.minutes;
		
		return {
			hours: hours,
			minutes: minutes
		};
	}

	/**
	 * Accumulates the total time for a given context and type across all timelogs.
	 *
	 * @method getAccumulatedTime
	 * @param {Array} timelogs - The timelogs to accumulate
	 * @param {String} context - The context ('spent' or 'est')
	 * @param {String} type - The type ('hours' or 'minutes')
	 * @returns {Number}
	 * @public
	 * @action
	 */
	@action
	getAccumulatedTime(timelogs, context, type) {
		return timelogs.reduce((acc, timelog) => {
			if (
				timelog.timelogContext[context] &&
				typeof timelog.timelogContext[context][type] === 'number'
			) {
				return acc + timelog.timelogContext[context][type];
			}
			return acc;
		}, 0);
	}

	/**
	 * Filters timelogs by context (spent or estimated) for a given array of issues.
	 *
	 * @method filterTimelogsByContext
	 * @param {Array} issues - The array of issues to filter
	 * @param {String} context - The context to filter by ('spent' or 'estimated')
	 * @returns {Array} - The filtered array of issues
	 * @public
	 * @action
	 */
	@action
	filterTimelogsByContext(issues, context) {
		let _self = this;
		let otherContext = context === 'spent' ? 'estimated' : 'spent';
		return issues.map((issue) => {
			let filteredTimelogs = issue[context]?.filter((timelog) => {
				return timelog.createdUser === _self.args.currentUser.user.id;
			});
			let updatedIssue = {
				issueNumber: issue.issueNumber,
				subject: issue.subject,
				status: issue.status,
				projectShortcode: issue.projectShortcode,
				[context]: filteredTimelogs,
				[otherContext]: issue[otherContext]
			};
			return updatedIssue;
		});
	}
}
