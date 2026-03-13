/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
	 * Handles the search functionality for the milestones table
	 * Updates the filteredData property with the filtered results
	 *
	 * @method handleSearch
	 * @param {string} query - The search query
	 * @param {Array} filteredDataByTableComponent - The filtered data from the table component
	 * @public
	 * @action
	 */
	@action
	handleSearch(query, filteredDataByTableComponent) {
		this.filteredData = filteredDataByTableComponent;
	}

	/**
	 * Refreshes the widget by re-fetching milestones using the original widget
	 * options. Resets filtered and original data.
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
		return {
			items: milestones
		};
	}
}
