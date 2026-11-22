/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
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

// The tree fixture: top rows grouped by relation, the current issue between the groups, and the children each
// expandable row loads on demand.
const TREE = [
	{ id: 't1', name: 'Blocked by: Agent A', level: 1, group: 'blocked by', children: ['t1a', 't1b'] },
	{ id: 'me', name: 'This issue', level: 1, group: null, children: [] },
	{ id: 't2', name: 'Relates to: Agent B', level: 1, group: 'relates to', children: ['t2a'] },
];
const CHILDREN = {
	t1a: { id: 't1a', name: 'Agent C', level: 2, children: ['t1a1'] },
	t1b: { id: 't1b', name: 'Agent D', level: 2, children: [] },
	t1a1: { id: 't1a1', name: 'Agent E', level: 3, children: [] },
	t2a: { id: 't2a', name: 'Agent F', level: 2, children: [] },
};
const LOAD_DELAY = 400;

/**
 * The AppUi::DataTable demo of the Component Library. It sorts, groups and pages an in-memory fixture (three
 * pages) and keeps a shared Selection across the pages. Sort, selection, row actions and the more menu go to the
 * entry's event log. The tree switch shows tree rows: carets load the next level after a short delay (the
 * demo plays the owner), with the current row pinned between the relation groups.
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
	@tracked tree = false;
	@tracked expandedIds = [];
	@tracked loadingIds = [];

	selection = new Selection();

	columns = [
		{ key: 'name', label: 'Name', sortable: true, subKey: 'note' },
		{ key: 'model', label: 'Model', sortable: true },
		{ key: 'status', label: 'Status' },
	];

	treeColumns = [{ key: 'name', label: 'Linked issue' }];

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

	/**
	 * The tree fixture flattened in order: each expanded row followed by its children, which take its group.
	 *
	 * @property treeRows
	 * @type Array
	 */
	get treeRows() {
		let rows = [];
		let add = (row, group) => {
			rows.push({ ...row, group });
			if (this.expandedIds.includes(row.id)) {
				row.children.forEach((id) => add(CHILDREN[id], group));
			}
		};
		TREE.forEach((row) => add(row, row.group));
		return rows;
	}

	get isExpandable() {
		return (record) => record.children.length > 0;
	}

	get treeGroupKey() {
		return (record) => record.group;
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

	/**
	 * Plays the owner of a tree: collapses an open row, or marks the row loading and opens it after a delay.
	 *
	 * @method toggleRow
	 * @param {Object} log the entry's event log
	 * @param {Object} record the row clicked
	 */
	@action
	toggleRow(log, record) {
		if (this.expandedIds.includes(record.id)) {
			this.expandedIds = this.expandedIds.filter((id) => id !== record.id);
			log.log('collapse', record.id);
			return;
		}
		log.log('expand', record.id);
		this.loadLevel.perform(record);
	}

	/**
	 * Marks the row loading, waits as a server would, then opens it. Cancelled with the component.
	 *
	 * @property loadLevel
	 * @type Task
	 */
	loadLevel = task(async (record) => {
		this.loadingIds = [...this.loadingIds, record.id];
		await timeout(LOAD_DELAY);
		this.loadingIds = this.loadingIds.filter((id) => id !== record.id);
		this.expandedIds = [...this.expandedIds, record.id];
	});

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
		this.tree = false;
		this.expandedIds = [];
		this.loadingIds = [];
		this.selection.clear();
	}
}
