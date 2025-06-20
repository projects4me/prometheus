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

	/**
	 * The filter callbacks for the table component
	 * @property filterCallbacks
	 * @type {Object}
	 * @public
	 */
	get filterCallbacks() {
		return {
			'assignedToMe': this.filterAssignedToMe,
			'inProgressIssues': this.filterInProgressIssues
		};
	}

	/**
	 * Filter callback for issues assigned to the current user
	 * @method filterAssignedToMe
	 * @param {Array} data - The data to filter
	 * @returns {Array} - The filtered data
	 * @public
	 * @action
	 */
	@action
	filterAssignedToMe(data) {
		let currentUser = this.args.currentUser.user;
		return data.filter(item => item.assignee === currentUser.id);
	}
	
	/**
	 * Filter callback for in-progress issues
	 * @method filterInProgressIssues
	 * @param {Array} data - The data to filter
	 * @returns {Array} - The filtered data
	 * @public
	 * @action
	 */
	@action
	filterInProgressIssues(data) {
		return data.filter(item => item.status === 'in_progress');
	}

	/**
	 * Sets the filtered data
	 * @method setData
	 * @param {Array} data - The data to set
	 * @public
	 * @action
	 */
	@action
	setData(data) {
		this.filteredData = data;
	}
}
