/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

const ICONS = {
	none: 'fa-square-o',
	some: 'fa-minus-square-o',
	all: 'fa-check-square',
};

/**
 * Select-all box for a QuickList: shows none, some or all selected.
 *
 * @class QuickListSelectAllComponent
 * @namespace Prometheus.Components
 * @extends Component
 *
 * @example
 * <QuickList::SelectAll @state="some" @onToggle={{this.toggleAll}} />
 */
export default class QuickListSelectAllComponent extends Component {
	@service intl;

	get state() {
		return ICONS[this.args.state] ? this.args.state : 'none';
	}

	get icon() {
		return ICONS[this.state];
	}

	get ariaPressed() {
		return this.state === 'all' ? 'true' : this.state === 'some' ? 'mixed' : 'false';
	}

	get label() {
		return this.intl.t(
			this.state === 'all'
				? 'components.quickList.selection.deselectAll'
				: 'components.quickList.selection.selectAll'
		);
	}

	@action
	toggle() {
		this.args.onToggle?.();
	}
}
