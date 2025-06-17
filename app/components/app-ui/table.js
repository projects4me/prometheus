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
 *   @onLoadMore={{this.loadMoreItems}}
 *   @showSearch={{true}}
 *   @searchPlaceholder="Search items..."
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
	 * The filtered data based on the current search query
	 * @property filteredData
	 * @type {Array}
	 * @public
	 */
	@tracked filteredData = this.args.data || [];

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
		return this.args.searchPlaceholder || this.intl.t('views.app.components.table.searchPlaceholder');
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
		return this.filteredData;
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
		if (this.args.applyDefaultSearch) {
			if (!query || query.length === 0) {
				this.filteredData = this.args.data;
				this.onSearch(query, this.filteredData);
				return;
			}

			const searchFields = this.args.searchFields || [];
			this.filteredData = this.args.data.filter((item) => {
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

			if (this.onSearch) {
				this.onSearch(query, this.filteredData);
				return;
			}
		} else {
			this.onSearch(query, this.args.data);
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
}
