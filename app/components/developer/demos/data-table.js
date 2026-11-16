/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Selection from 'prometheus/utils/state/selection';

const PAGE_SIZE = 4;
const PAGES = 3;
const STATUSES = ['active', 'paused', 'archived'];

const ROWS = Array.from({ length: PAGE_SIZE * PAGES }, (_, i) => ({
	id: String(i + 1),
	name: `Agent ${String.fromCharCode(65 + i)}`,
	model: ['sonnet', 'opus', 'haiku'][i % 3],
	status: STATUSES[i % 3],
	note: `Fixture row ${i + 1}`,
}));

/**
 * The AppUi::DataTable demo of the Component Library. It sorts, groups and pages an in-memory fixture (three
 * pages) and keeps a shared Selection across the pages. Sort, selection, row actions and the more menu go to the
 * entry's event log.
 *
 * @class DeveloperDemosDataTableComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosDataTableComponent extends Component {
	@tracked page = 1;
	@tracked sort = 'name';
	@tracked order = 'asc';
	@tracked grouped = false;
	@tracked selectable = true;
	@tracked showActions = true;
	@tracked empty = false;

	selection = new Selection();

	columns = [
		{ key: 'name', label: 'Name', sortable: true, subKey: 'note' },
		{ key: 'model', label: 'Model', sortable: true },
		{ key: 'status', label: 'Status' },
	];

	get pages() {
		return Array.from({ length: PAGES }, (_, i) => i + 1);
	}

	/**
	 * The sorted rows of the current page; none when the empty switch is on.
	 *
	 * @property rows
	 * @type Array
	 */
	get rows() {
		if (this.empty) {
			return [];
		}
		let dir = this.order === 'desc' ? -1 : 1;
		let sorted = [...ROWS].sort((a, b) => String(a[this.sort]).localeCompare(String(b[this.sort])) * dir);
		let start = (this.page - 1) * PAGE_SIZE;
		return sorted.slice(start, start + PAGE_SIZE);
	}

	get groupKey() {
		return this.grouped ? (record) => record.status : undefined;
	}

	get groupLabel() {
		return (key) => key;
	}

	get selectedCount() {
		return this.selection.count;
	}

	@action
	flip(name) {
		this[name] = !this[name];
	}

	@action
	setPage(page) {
		this.page = page;
	}

	@action
	sortBy(log, key) {
		this.order = this.sort === key && this.order === 'asc' ? 'desc' : 'asc';
		this.sort = key;
		log.log('sort', `${key} ${this.order}`);
	}

	@action
	selectionChanged(log, ids) {
		log.log('selection', ids.join(','));
	}

	@action
	act(log, name, record) {
		log.log(name, record.id);
	}

	@action
	reset() {
		this.page = 1;
		this.sort = 'name';
		this.order = 'asc';
		this.grouped = false;
		this.selectable = true;
		this.showActions = true;
		this.empty = false;
		this.selection.clear();
	}
}
