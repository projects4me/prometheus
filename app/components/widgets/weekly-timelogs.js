/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import DateUtils from 'prometheus/utils/date';

/**
 * A widget component that displays weekly timelogs grouped by issue.
 * Provides filtering, searching, and pagination by week, and calculates total spent and estimated time.
 *
 * @class WidgetsWeeklyTimelogsComponent
 * @namespace Prometheus.Components.Widgets
 * @module Widgets.WeeklyTimelogs
 * @extends WidgetsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <Widgets::WeeklyTimelogs
 *   @data={{this.timelogs}}
 *   @widgetSettings={{this.widgetSettings}}
 *   @currentUser={{this.currentUser}}
 * />
 */
export default class WidgetsWeeklyTimelogsComponent extends WidgetsComponent {
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
		let limit = this.args.widgetSettings.limit || 10;
		const data = await this.store.query('timelog', {
			query: `(Timelog.spentOn BETWEEN ${startOfWeek} AND ${endOfWeek})`,
			limit: limit,
			rels: 'issue'
		});
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
	get timelogsByIssueNumber() {
		let data = this.filteredData;
		let timelogs = [];
		let timelogKeys = {};
		let _self = this;
		let projects = [];
		data?.forEach((timelog) => {
			// maintain all projects that have timelogs to show in the filters dropdown
			if (!projects.includes(timelog.projectShortcode)) {
				projects.push(timelog.projectShortcode);
			}

			let issue = timelog.issue;
			let issueNumber = issue.get('issueNumber');
			let daysToHours = timelog.days * 8;
			let hours = parseInt(timelog.hours, 10) + parseInt(daysToHours, 10);
			let duration = moment.duration({
				hours: hours,
				minutes: timelog.minutes
			});
			let hrs = duration.asHours();
			let timelogContext = {};
			timelogContext[timelog.context] = _self.formatHoursFloat(hrs);

			if (Object.keys(timelogKeys).includes(issueNumber)) {
				let tl = timelogs[timelogKeys[issueNumber]];
				if (tl.timelogContext[timelog.context]) {
					tl.timelogContext[timelog.context].hours +=
						timelogContext[timelog.context].hours;
					tl.timelogContext[timelog.context].minutes +=
						timelogContext[timelog.context].minutes;
				} else {
					tl.timelogContext[timelog.context] =
						timelogContext[timelog.context];
				}
			} else {
				timelogs.pushObject({
					issueNumber: issueNumber,
					issueSubject: issue.get('subject'),
					issueStatus: issue.get('status'),
					timelogContext: timelogContext,
					projectShortcode: timelog.projectShortcode
				});
				timelogKeys[issueNumber] = timelogs.length - 1;
			}
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
					`views.app.widgets.weeklyTimelogs.filters.${filter}`
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
	filterMyTimeLogs(data) {
		let _self = this;
		return data.filter((timelog) => {
			return timelog.createdUser === _self.args.currentUser.user.id;
		});
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
				? 'views.app.widgets.weeklyTimelogs.noTimelogsFound'
				: 'views.app.widgets.weeklyTimelogs.emptyStateMessage'
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
}
