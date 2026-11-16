/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const LIMIT = 20;
const TOTAL = 64;

/**
 * The AppUi::Pager demo of the Component Library. The state switch forces the pager into its states (first
 * page, middle, last page, unknown total, disabled); page changes go to the entry's event log.
 *
 * @class DeveloperDemosPagerComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosPagerComponent extends Component {
	@tracked state = 'first page';
	@tracked offset = 0;

	limit = LIMIT;

	states = ['first page', 'middle', 'last page', 'unknown total', 'disabled'];

	/**
	 * Whether the state leaves the record count unknown.
	 *
	 * @property isUnknownTotal
	 * @type Boolean
	 */
	get isUnknownTotal() {
		return this.state === 'unknown total';
	}

	/**
	 * The record count handed to the pager, none when unknown.
	 *
	 * @property total
	 * @type Number
	 */
	get total() {
		return this.isUnknownTotal ? undefined : TOTAL;
	}

	/**
	 * Rows shown on the current page.
	 *
	 * @property count
	 * @type Number
	 */
	get count() {
		return Math.min(LIMIT, TOTAL - this.offset);
	}

	/**
	 * Whether rows exist after the current page.
	 *
	 * @property hasMore
	 * @type Boolean
	 */
	get hasMore() {
		return this.offset + LIMIT < TOTAL;
	}

	@action
	setState(state) {
		this.state = state;
		if (state === 'first page' || state === 'disabled' || state === 'unknown total') {
			this.offset = 0;
		} else if (state === 'middle') {
			this.offset = LIMIT;
		} else if (state === 'last page') {
			this.offset = Math.floor((TOTAL - 1) / LIMIT) * LIMIT;
		}
	}

	@action
	changePage(log, offset) {
		this.offset = offset;
		log.log('page', String(offset));
	}

	@action
	reset() {
		this.setState('first page');
	}
}
