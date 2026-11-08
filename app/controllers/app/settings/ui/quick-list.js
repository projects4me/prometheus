/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { postToast } from 'prometheus/utils/ui/post-toast';
import { issueStatusLabel } from 'prometheus/utils/issue-status/label';
import { buildQuickListFixture } from 'prometheus/utils/dev/quick-list-fixture';

const PAGE_SIZE = 20;

/**
 * The controller of the QuickList showcase page. It pages, sorts, groups and filters the fixture in
 * memory, so the page needs no Gaia call.
 *
 * @class AppSettingsUiQuickListController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends Controller
 */
export default class AppSettingsUiQuickListController extends Controller {
	@service intl;

	fixture = buildQuickListFixture();

	limit = PAGE_SIZE;

	@tracked page = 1;
	@tracked sort = 'updated';
	@tracked order = 'desc';
	@tracked groupBy = '';
	@tracked filter = '';

	/**
	 * The forced state of the list: `''` (normal), `loading`, `empty` or `error`.
	 *
	 * @property state
	 * @type {String}
	 */
	@tracked state = '';

	states = ['', 'loading', 'empty', 'error'];

	get sortOptions() {
		return ['updated', 'created', 'title'].map((key) => ({
			key,
			label: this.intl.t(`views.app.settings.ui.quickList.sort.${key}`),
		}));
	}

	get groupOptions() {
		return [
			{ key: '', label: this.intl.t('components.quickList.toolbar.none') },
			{
				key: 'status',
				label: this.intl.t('views.app.settings.ui.quickList.group.status'),
				groupKey: (record) => record.status,
				groupLabel: (key) => issueStatusLabel(this.intl, key),
			},
			{
				key: 'creator',
				label: this.intl.t('views.app.settings.ui.quickList.group.creator'),
				groupKey: (record) => record.creator,
			},
		];
	}

	/**
	 * The fixture records matching the title filter, in the chosen order.
	 *
	 * @property matches
	 * @type {Array}
	 */
	get matches() {
		let needle = this.filter.trim().toLowerCase();
		let list = this.fixture.filter((r) => !needle || r.title.toLowerCase().includes(needle));
		let direction = this.order === 'asc' ? 1 : -1;
		let key = this.sort;
		return list.sort((a, b) => {
			let result = key === 'title' ? a.title.localeCompare(b.title) : a[key].localeCompare(b[key]);
			return result * direction;
		});
	}

	get total() {
		return this.state === 'empty' ? 0 : this.matches.length;
	}

	/**
	 * The records of the current page; none while a forced state is on.
	 *
	 * @property items
	 * @type {Array}
	 */
	get items() {
		if (this.state) {
			return [];
		}
		let start = (this.page - 1) * this.limit;
		return this.matches.slice(start, start + this.limit);
	}

	get isLoading() {
		return this.state === 'loading';
	}

	get isError() {
		return this.state === 'error';
	}

	@action
	setPage(page) {
		this.page = page;
	}

	@action
	setSort(key, order) {
		this.sort = key;
		this.order = order;
		this.page = 1;
	}

	@action
	setGroup(key) {
		this.groupBy = key;
	}

	@action
	setFilter(event) {
		this.filter = event.target.value;
		this.page = 1;
	}

	@action
	clearFilter() {
		this.filter = '';
		this.page = 1;
	}

	@action
	setState(state) {
		this.state = state;
	}

	@action
	retry() {
		this.state = '';
	}

	/**
	 * Dummy selection action: shows a toast with the number of selected records.
	 *
	 * @method act
	 * @param {String} name `archive` or `delete`
	 * @param {Array} selected the selected ids
	 * @param {Function} clear clears the selection
	 */
	@action
	act(name, selected, clear) {
		postToast(this.intl, `views.app.settings.ui.quickList.actions.${name}Done`, 'success', {
			count: selected.length,
		});
		clear();
	}

	@action
	newRecord() {
		postToast(this.intl, 'views.app.settings.ui.quickList.actions.newDone', 'success');
	}
}
