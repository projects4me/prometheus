/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import WidgetsComponent from '../widgets';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * A widget component that displays recent issues in a table format.
 * This component extends the base WidgetsComponent and provides functionality
 * to display and filter recent issue data.
 *
 * @class WidgetsRecentIssuesComponent
 * @extends WidgetsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class WidgetsRecentIssuesComponent extends WidgetsComponent {
	/**
	 * The filtered data based on search criteria
	 * @property filteredData
	 * @type {Array}
	 * @public
	 */
	@tracked filteredData = this.args.data || [];

	/**
	 * Handles the search functionality for the recent issues table
	 * Updates the filteredData property with the filtered results from the table component
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
