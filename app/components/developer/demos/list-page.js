/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The fixture records of the demo.
 *
 * @property RECORDS
 * @type Array
 * @private
 */
const RECORDS = Array.from({ length: 23 }, (_, index) => ({
	id: String(index + 1),
	name: `Agent ${index + 1}`,
	models: index % 2 ? 'sonnet' : 'opus',
	isActive: index % 3 !== 0,
}));

/**
 * The page size of the demo.
 *
 * @property LIMIT
 * @type Number
 * @private
 */
const LIMIT = 10;

/**
 * The list-page parts demo of the Component Library: AppUi::ListToolbar, AppUi::DataTable and AppUi::Pager
 * composed as on the Agents list, on fixture data. Sorting, paging and selection are logged to the entry's
 * event log; it serves the three parts' entries.
 *
 * @class DeveloperDemosListPageComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosListPageComponent extends Component {
	@tracked offset = 0;
	@tracked sort = 'name';
	@tracked order = 'asc';
	@tracked selected = [];
	@tracked empty = false;

	limit = LIMIT;

	/**
	 * The columns of the demo table.
	 *
	 * @property columns
	 * @type Array
	 */
	columns = [
		{ key: 'name', label: 'Agent', sortable: true },
		{ key: 'models', label: 'Models', sortable: true },
		{ key: 'status', label: 'Status' },
	];

	/**
	 * The sorted fixture records.
	 *
	 * @property sorted
	 * @type Array
	 */
	get sorted() {
		let direction = this.order === 'desc' ? -1 : 1;
		return [...RECORDS].sort((a, b) => String(a[this.sort]).localeCompare(String(b[this.sort]), undefined, { numeric: true }) * direction);
	}

	/**
	 * The records of the current page.
	 *
	 * @property rows
	 * @type Array
	 */
	get rows() {
		return this.empty ? [] : this.sorted.slice(this.offset, this.offset + LIMIT);
	}

	/**
	 * @property hasMore
	 * @type Boolean
	 */
	get hasMore() {
		return !this.empty && this.offset + LIMIT < RECORDS.length;
	}

	@action
	changeSort(log, key) {
		this.order = key === this.sort && this.order === 'asc' ? 'desc' : 'asc';
		this.sort = key;
		log.log('sort', `${key} ${this.order}`);
	}

	@action
	changePage(log, offset) {
		this.offset = offset;
		log.log('page', String(offset));
	}

	@action
	select(log, id, checked) {
		this.selected = checked ? [...this.selected, id] : this.selected.filter((item) => item !== id);
		log.log('select', `${id} ${checked}`);
	}

	@action
	create(log) {
		log.log('create');
	}

	@action
	bulk(log) {
		log.log('delete', this.selected.join(', ') || 'none');
	}

	@action
	toggleEmpty(event) {
		this.empty = event.target.checked;
		this.offset = 0;
	}

	@action
	reset() {
		this.offset = 0;
		this.sort = 'name';
		this.order = 'asc';
		this.selected = [];
		this.empty = false;
	}
}
