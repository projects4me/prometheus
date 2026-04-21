/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Logger from 'js-logger';
import { fetchMilestoneOverviewsBulk } from 'prometheus/utils/milestone-overview-api';

/**
 * Normalizes milestone data from args, RecordArray, or plain array into a plain array.
 *
 * @param {*} data
 * @return {Array}
 */
function toMilestoneArray(data) {
	if (!data) {
		return [];
	}
	if (typeof data.toArray === 'function') {
		return data.toArray();
	}
	return Array.isArray(data) ? data : [];
}

/**
 * A widget component that displays active milestones in a table format.
 * This component extends the base WidgetsComponent and provides functionality
 * to display and filter milestone data.
 *
 * @class WidgetsActiveMilestonesComponent
 * @extends WidgetsComponent
 */
export default class WidgetsActiveMilestonesComponent extends WidgetsComponent {

	/**
	 * The session service used to retrieve the auth token for raw fetch calls.
	 * @property session
	 * @type {Ember.Service}
	 * @private
	 */
	@service session;

	/**
	 * The filtered data based on search criteria
	 * @property filteredData
	 * @type {Array}
	 * @public
	 */
	@tracked filteredData = this.args.data || [];

	/**
	 * The original data
	 * @property originalData
	 * @type {Array}
	 * @public
	 */
	@tracked originalData = this.args.data || [];

	/**
	 * A map of milestoneId → raw milestone overview API response (or null on failure).
	 * Key missing = still loading. Uses shared milestone-overview-api util.
	 *
	 * @property milestoneOverviews
	 * @type {Object}
	 * @public
	 */
	@tracked milestoneOverviews = {};

	constructor() {
		super(...arguments);
		this.fetchMilestoneOverviews(this.args.data);
	}

	/**
	 * Fetches milestone overview for every milestone in the given list in parallel.
	 *
	 * @method fetchMilestoneOverviews
	 * @param {*} milestonesSource
	 * @param {Object} [options]
	 * @param {boolean} [options.merge=false]
	 * @return {Promise<void>}
	 * @private
	 */
	async fetchMilestoneOverviews(milestonesSource, { merge = false } = {}) {
		let milestones = toMilestoneArray(milestonesSource);

		if (milestones.length === 0) {
			if (!merge) {
				this.milestoneOverviews = {};
			}
			return;
		}

		if (!merge) {
			this.milestoneOverviews = {};
		}

		let token = this.session.data.authenticated.access_token;

		try {
			let results = await fetchMilestoneOverviewsBulk(milestones, token);
			let overviewsMap = {};
			results.forEach(({ id, overview }) => {
				overviewsMap[id] = overview;
			});

			if (merge) {
				this.milestoneOverviews = { ...this.milestoneOverviews, ...overviewsMap };
			} else {
				this.milestoneOverviews = overviewsMap;
			}
		} catch (error) {
			Logger.error('WidgetsActiveMilestonesComponent: fetchMilestoneOverviews failed', error);
		}
	}

	/**
	 * Handles the search functionality for the milestones table
	 *
	 * @method handleSearch
	 * @public
	 * @action
	 */
	@action
	handleSearch(query, filteredDataByTableComponent) {
		this.filteredData = filteredDataByTableComponent;
	}

	/**
	 * Refreshes the widget by re-fetching milestones using the original widget options.
	 *
	 * @method refresh
	 * @public
	 * @action
	 */
	@action
	async refresh() {
		let milestoneOptions = this.baseOptions();
		let milestones = await this.store.query('milestone', milestoneOptions);
		this.originalData = milestones;
		this.filteredData = milestones;
		await this.fetchMilestoneOverviews(milestones);
	}

	/**
	 * Loads more milestones.
	 *
	 * @method onLoadMore
	 * @public
	 * @action
	 */
	@action
	async onLoadMore(paginationInfo = {}) {
		let milestoneOptions = this.baseOptions();
		milestoneOptions.page = paginationInfo.page;
		milestoneOptions.limit = paginationInfo.pageSize;
		let milestones = await this.store.query('milestone', milestoneOptions);
		this.filteredData = [
			...this.filteredData.toArray(),
			...milestones.toArray()
		];
		this.originalData = [
			...this.originalData.toArray(),
			...milestones.toArray()
		];
		await this.fetchMilestoneOverviews(milestones, { merge: true });
		return {
			items: milestones
		};
	}
}
