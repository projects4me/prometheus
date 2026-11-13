/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { issueStatusLabel } from 'prometheus/utils/issue-status/label';
import {
	buildQuickListFixture,
	QUICK_LIST_FIXTURE_CREATORS,
	QUICK_LIST_FIXTURE_STATUSES,
	QUICK_LIST_FIXTURE_TAGS,
} from 'prometheus/utils/dev/quick-list-fixture';
import { matchesTree } from 'prometheus/utils/dev/quick-list-query';
import EventLog from 'prometheus/utils/developer/event-log';
import { createSchema } from 'prometheus/utils/query/schema';
import { parse } from 'prometheus/utils/query/parse';

const SORTS = [
	{ key: 'updated', label: 'Updated' },
	{ key: 'created', label: 'Created' },
	{ key: 'title', label: 'Title' },
];

/**
 * The QuickList demo of the Component Library. It pages, sorts, groups and searches an in-memory fixture, so
 * it needs no Gaia call. Every callback passed to QuickList goes through the entry's event log.
 *
 * @class DeveloperDemosQuickListComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosQuickListComponent extends Component {
	@service intl;

	fixture = buildQuickListFixture();

	log = new EventLog();

	limits = [5, 10, 20];
	groupKeys = ['none', 'status', 'creator'];

	@tracked state = 'normal';
	@tracked selectable = true;
	@tracked searchOn = true;
	@tracked groupBy = '';
	@tracked limit = 10;
	@tracked page = 1;
	@tracked sort = 'updated';
	@tracked order = 'desc';
	@tracked query = '';

	/**
	 * The ezSearch schema of the fixture: title, status, creator and tag.
	 *
	 * @property schema
	 * @type Object
	 */
	get schema() {
		let status = QUICK_LIST_FIXTURE_STATUSES.map((value) => ({ value, label: issueStatusLabel(this.intl, value) }));
		let named = (list) => list.map((value) => ({ value, label: value }));
		return createSchema({
			module: 'Issue',
			textField: 'Issue.title',
			fields: [
				{ id: 'Issue.title', aliases: ['title'], label: 'Title', type: 'text' },
				{ id: 'Issue.status', aliases: ['status'], label: 'Status', type: 'enum', valueSource: 'status' },
				{ id: 'Issue.creator', aliases: ['creator'], label: 'Creator', type: 'enum', valueSource: 'creator' },
				{ id: 'Issue.tag', aliases: ['tag'], label: 'Tag', type: 'enum', valueSource: 'tag' },
			],
			values: { status, creator: named(QUICK_LIST_FIXTURE_CREATORS), tag: named(QUICK_LIST_FIXTURE_TAGS) },
		});
	}

	get sortOptions() {
		return SORTS;
	}

	get groupOptions() {
		return [
			{ key: '', label: this.intl.t('components.quickList.toolbar.none') },
			{
				key: 'status',
				label: 'Status',
				groupKey: (record) => record.status,
				groupLabel: (key) => issueStatusLabel(this.intl, key),
			},
			{ key: 'creator', label: 'Creator', groupKey: (record) => record.creator },
		];
	}

	/**
	 * The records matching the applied query, in the chosen order.
	 *
	 * @property matches
	 * @type Array
	 */
	get matches() {
		let tree = this.query ? parse(this.query, this.schema).tree : null;
		let direction = this.order === 'asc' ? 1 : -1;
		let key = this.sort;
		return this.fixture
			.filter((record) => !tree || matchesTree(record, tree))
			.sort((a, b) => a[key].localeCompare(b[key]) * direction);
	}

	/**
	 * One page of records plus one more, the way a Gaia request asks for `limit + 1` (no totals).
	 *
	 * @property window
	 * @type Array
	 */
	get window() {
		if (this.state === 'empty') {
			return [];
		}
		let start = (this.page - 1) * this.limit;
		return this.matches.slice(start, start + this.limit + 1);
	}

	get items() {
		return this.state === 'normal' ? this.window.slice(0, this.limit) : [];
	}

	get hasNext() {
		return this.state === 'normal' && this.window.length > this.limit;
	}

	get isLoading() {
		return this.state === 'loading';
	}

	get isError() {
		return this.state === 'error';
	}

	get groupValue() {
		return this.groupBy || 'none';
	}

	@action
	setState(state) {
		this.state = state;
	}

	@action
	setSelectable(event) {
		this.selectable = event.target.checked;
	}

	@action
	setSearchOn(event) {
		this.searchOn = event.target.checked;
	}

	@action
	setGroupBy(event) {
		this.groupBy = event.target.value === 'none' ? '' : event.target.value;
	}

	@action
	setLimit(event) {
		this.limit = Number(event.target.value);
		this.page = 1;
	}

	@action
	setPage(page) {
		this.log.log('onPage', page);
		this.page = page;
	}

	@action
	setSort(key, order) {
		this.log.log('onSort', key, order);
		this.sort = key;
		this.order = order;
		this.page = 1;
	}

	@action
	setGroup(key) {
		this.log.log('onGroup', key);
		this.groupBy = key;
	}

	@action
	applyQuery(query) {
		this.log.log('onApply', query);
		this.query = query || '';
		this.page = 1;
	}

	@action
	clearSearch() {
		this.log.log('onClearSearch');
		this.query = '';
		this.page = 1;
	}

	@action
	retry() {
		this.log.log('onRetry');
		this.state = 'normal';
	}

	@action
	select(name, selected, clear) {
		this.log.log(name, selected);
		clear();
	}

	@action
	newRecord() {
		this.log.log('new');
	}

	/**
	 * Back to the initial state of the demo.
	 *
	 * @method reset
	 */
	@action
	reset() {
		this.state = 'normal';
		this.selectable = true;
		this.searchOn = true;
		this.groupBy = '';
		this.limit = 10;
		this.page = 1;
		this.sort = 'updated';
		this.order = 'desc';
		this.query = '';
	}
}
