/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import DateUtils from 'prometheus/utils/date';

/**
 * A widget component that displays weekly activities grouped by module (issue or project).
 * Provides pagination by week and fetches activities for the selected week.
 *
 * @class WidgetsWeeklyActivitiesComponent
 * @namespace Prometheus.Components.Widgets
 * @module Widgets.WeeklyActivities
 * @extends WidgetsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <Widgets::WeeklyActivities
 *   @data={{this.activities}}
 *   @widgetSettings={{this.widgetSettings}}
 * />
 */
export default class WidgetsWeeklyActivitiesComponent extends WidgetsComponent {
	/**
	 * The list of activity records to display, provided via the component's arguments.
	 * @property activities
	 * @type {Array}
	 * @public
	 */
	@tracked activities = this.args.data || [];

	/**
	 * Whether a refresh operation is currently in progress
	 * @property isRefreshing
	 * @type {boolean}
	 * @public
	 */
	@tracked isRefreshing = false;

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
	 * Groups activities by their related module (issue or project).
	 * Issues are grouped by issue number, projects by project name.
	 *
	 * @property activitiesList
	 * @type {Object}
	 * @public
	 */
	get activitiesList() {
		const activitiesByModule = {};
		this.activities.forEach((activity) => {
			const key =
				activity.relatedTo === 'issue'
					? `#${activity.issue.get('issueNumber')}`
					: activity.project.get('name');

			if (!activitiesByModule[key]) {
				activitiesByModule[key] = [];
			}
			activitiesByModule[key].push(activity);
		});
		return activitiesByModule;
	}

	/**
	 * Queries the store for activities within the given week range.
	 * Single source of truth for the activity fetch used by both
	 * onPageChange and refresh.
	 *
	 * @method fetchActivities
	 * @param {String} startWeek - Start of the week range
	 * @param {String} endWeek - End of the week range
	 * @returns {Promise<Array>}
	 * @private
	 */
	async fetchActivities(startWeek, endWeek) {
		let activityOptions = this.baseOptions();
		activityOptions.query = `(Activity.dateCreated BETWEEN ${startWeek} AND ${endWeek})`;
		activityOptions.rels = 'issue,project';
		return await this.store.query('activity', activityOptions);
	}

	/**
	 * Refreshes the widget by re-fetching activities for the currently
	 * displayed week.
	 *
	 * @method refresh
	 * @public
	 * @action
	 */
	@action
	async refresh() {
		this.isRefreshing = true;
		try {
			this.activities = await this.fetchActivities(this.startWeek, this.endWeek);
		} finally {
			this.isRefreshing = false;
		}
	}

	/**
	 * Handles pagination changes, fetching activities for the selected week.
	 *
	 * @method onPageChange
	 * @param {Object} paginationInfo - Contains the page number (week index)
	 * @public
	 * @action
	 * @returns {Promise<Object>} - Resolves with the new activities
	 */
	@action
	async onPageChange(paginationInfo = {}) {
		const { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(
			paginationInfo.page
		);
		this.startWeek = startOfWeek;
		this.endWeek = endOfWeek;
		this.activities = await this.fetchActivities(this.startWeek, this.endWeek);
		return {
			items: this.activities
		};
	}
}
