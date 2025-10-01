/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoard
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardComponent extends Component {
	/**
	 * This property is used to keep track the query, which is provided by the user, for
	 * filtering the issues.
	 *
	 * @property query
	 * @type String
	 * @for TaskBoard
	 * @protected
	 */
	@tracked query;

	/**
	 * This property is used to keep track of the query, which is provided by the user, for
	 * filtering the issues.
	 *
	 * @property filterQuery
	 * @type String
	 * @for TaskBoard
	 * @protected
	 */
	@tracked filterQuery = '';

	/**
	 * This property is used to keep track of the currently active search filter.
	 *
	 * @property activeSearch
	 * @type Object
	 * @for TaskBoard
	 * @protected
	 */
	@tracked activeSearch = null;

	/**
	 * This action is used to toggle the search filter on/off.
	 * If the same search is clicked again, it will be deactivated.
	 * If a different search is clicked, it will replace the current one.
	 *
	 * @method toggleSearch
	 * @param {Object} search The search object to toggle
	 * @public
	 */
	@action
	toggleSearch(search) {
		if (this.activeSearch && this.activeSearch.id === search.id) {
			// Same search clicked - deactivate it
			this.activeSearch = null;
			this.filterQuery = '';
			this.args.applySearch({ searchquery: '' });
		} else {
			// Different search clicked - activate it
			this.activeSearch = search;
			this.filterQuery = search.searchquery;
			this.args.applySearch(search);
		}
	}

	/**
	 * This computed property checks if a search is currently active.
	 *
	 * @method isSearchActive
	 * @param {Object} search The search object to check
	 * @returns {boolean} True if the search is active
	 * @public
	 */
	@action
	isSearchActive(search) {
		return this.activeSearch && this.activeSearch.id === search.id;
	}

	/**
	 * This action passes the selectIssue action to the milestones component
	 *
	 * @method selectIssue
	 * @param {Object} issue The issue to select
	 * @public
	 */
	@action
	selectIssue(issue) {
		if (this.args.selectIssue) {
			this.args.selectIssue(issue);
		}
	}
}
