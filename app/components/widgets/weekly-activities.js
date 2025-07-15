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
		let activityOptions = _.cloneDeep(this.args.widgetSettings.options);
		activityOptions.query = `(Activity.dateCreated BETWEEN ${this.startWeek} AND ${this.endWeek})`;
		activityOptions.rels = 'issue,project';
		let activities = await this.store.query('activity', activityOptions);
		this.activities = activities;
		return {
			items: activities
		};
	}
}
