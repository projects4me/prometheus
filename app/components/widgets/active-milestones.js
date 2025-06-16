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
}
