/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * A reusable table component that provides search, filtering, and pagination functionality.
 * This component can be used to display and manage tabular data with built-in search capabilities.
 *
 * @class AppUiTableComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <AppUi::Table
 *   @data={{this.items}}
 *   @columns={{this.tableColumns}}
 *   @searchFields={{['name', 'description']}}
 *   @applyDefaultSearch={{true}}
 *   @onSearch={{this.handleSearch}}
 *   @onLoadMore={{this.loadMore}}
 *   @showSearch={{true}}
 *   @searchPlaceholder="Search items..."
 *   @filterCallbacks={{this.filterCallbacks}}
 * >
 *   {{#each this.data as |item|}}
 *     <tr>
 *       <td>{{item.name}}</td>
 *       <td>{{item.description}}</td>
 *     </tr>
 *   {{/each}}
 * </AppUi::Table>
 */
export default class AppUiTableComponent extends Component {
	/**
	 * The intl service
	 * @property intl
	 * @type {Service}
	 * @public
	 */
	@service intl;

	/**
	 * The current search query entered by the user
	 * @property query
	 * @type {string}
	 * @public
	 */
	@tracked query = '';

	/**
	 * The filtered data based on the current search query and active filters
	 * @property filteredData
	 * @type {Array}
	 * @public
	 */
	@tracked filteredData = this.args.data || [];

	/**
	 * The active filters that are currently applied
	 * @property activeFilters
	 * @type {Array}
	 * @public
	 */
	@tracked activeFilters = [];

	/**
	 * Determines whether the search input should be displayed
	 * @property showSearch
	 * @type {boolean}
	 * @public
	 * @default true
	 */
	get showSearch() {
		return this.args.showSearch ?? true;
	}

	/**
	 * The placeholder text for the search input field
	 * @property searchPlaceholder
	 * @type {string}
	 * @public
	 * @default 'Search...'
	 */
	get searchPlaceholder() {
		return (
			this.args.searchPlaceholder ||
			this.intl.t('views.app.components.table.searchPlaceholder')
		);
	}

	/**
	 * The column configuration for the table
	 * @property columns
	 * @type {Array}
	 * @public
	 * @default []
	 */
	get columns() {
		return this.args.columns || [];
	}

	/**
	 * The data to be displayed in the table
	 * @property data
	 * @type {Array}
	 * @public
	 */
	get data() {
		let data = this.args.data;
		if (this.activeFilters.length > 0) {
			data = this.applyFilters(data);
		}
		return data;
	}

	/**
	 * Callback function to be executed when search is performed
	 * @property onSearch
	 * @type {Function}
	 * @public
	 * @default () => {}
	 */
	get onSearch() {
		return this.args.onSearch || (() => {});
	}

	/**
	 * Callback function to be executed when load more is triggered
	 * @property onLoadMore
	 * @type {Function}
	 * @public
	 * @default () => {}
	 */
	get onLoadMore() {
		return this.args.onLoadMore || (() => {});
	}

	/**
	 * Callback function to be executed when paginate is triggered
	 * @property onPaginate
	 * @type {Function}
	 * @public
	 * @default () => {}
	 */
	@action 
	async handlePaginate(page) {
		// reset the query and active filters
		this.query = '';
		this.activeFilters = [];
		if(this.args.onPaginate) {
			await this.args.onPaginate(page);
		}
	}

	/**
	 * The filter callbacks provided by the parent component
	 * @property filterCallbacks
	 * @type {Object}
	 * @public
	 * @default {}
	 */
	get filterCallbacks() {
		return this.args.filterCallbacks || {};
	}

	/**
	 * The filters configuration for the table
	 * @property filters
	 * @type {Array}
	 * @public
	 * @default []
	 */
	get filters() {
		const filters = this.args.filters || [];
		return filters.map((filter) => {
			return {
				label: filter.label,
				value: filter.name,
				isActive: this.activeFilters.includes(filter.name)
			};
		});	
	}

	/**
	 * Applies all active filters to the given data
	 * @method applyFilters
	 * @param {Array} data - The data to filter
	 * @returns {Array} - The filtered data
	 * @private
	 */
	applyFilters(data) {
		let filteredData = data.toArray ? data.toArray() : [...data];

		this.activeFilters.forEach((filterName) => {
			const filterCallback = this.filterCallbacks[filterName];
			if (filterCallback) {
				filteredData = filterCallback(filteredData);
			}
		});

		return filteredData;
	}

	/**
	 * Handles the search functionality for the table
	 * If applyDefaultSearch is true, it filters the data based on searchFields
	 * Otherwise, it calls the onSearch callback with the query and data
	 *
	 * @method handleSearch
	 * @param {Event} event - The input event from the search field
	 * @public
	 * @action
	 */
	@action
	handleSearch(event) {
		const query = event.target.value;
		this.query = query;
		let originalData = this.args.data;
		if (this.args.applyDefaultSearch) {
			if (!query || query.length === 0) {
				this.filteredData = this.applyFilters(originalData);
				this.onSearch(query, this.filteredData, false);
				return;
			}

			const searchFields = this.args.searchFields || [];
			const searchFilteredData = originalData.filter((item) => {
				return searchFields.some((field) => {
					const value = item.get(field);
					return (
						value &&
						(value
							.toString()
							.toLowerCase()
							.includes(query.toLowerCase()) ||
							value
								.toString()
								.toUpperCase()
								.includes(query.toUpperCase()))
					);
				});
			});

			this.filteredData = this.applyFilters(searchFilteredData);

			if (this.onSearch) {
				this.onSearch(query, this.filteredData, true);
				return;
			}
		} else {
			this.onSearch(query, originalData, false);
		}
	}

	/**
	 * Handles the load more functionality for pagination
	 * Calls the onLoadMore callback if it exists
	 *
	 * @method loadMore
	 * @public
	 * @action
	 */
	@action
	loadMore() {
		if (this.onLoadMore) {
			this.onLoadMore();
		}
	}

	/**
	 * Handles the filter toggle functionality for the table
	 * Toggles the filter and reapplies all filters and search
	 *
	 * @method handleFilterToggle
	 * @param {string} filterName - The name of the filter to toggle
	 * @public
	 * @action
	 */
	@action
	handleFilterToggle(filterName) {
		const originalData = this.args.data;
		if (this.activeFilters.includes(filterName)) {
			// Remove filter
			this.activeFilters = this.activeFilters.filter(
				(f) => f !== filterName
			);
		} else {
			// Add filter
			this.activeFilters = [...this.activeFilters, filterName];
		}

		if (this.query && this.query.length > 0) {
			this.handleSearch({ target: { value: this.query } });
		} else {
			this.filteredData = this.applyFilters(originalData);
			if(this.args.setData) {
				this.args.setData(this.filteredData);
			} else {
				console.error('pass setData function to the table component');
			}
		}
	}
}
