/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The collapsed group keys of a QuickList, remembered per `groupBy`.
 *
 * @class CollapseState
 * @namespace Prometheus.Utils.QuickList
 */
export default class CollapseState {
	/**
	 * @property collapsed
	 * @type {Object} groupBy => array of keys
	 */
	@tracked collapsed = {};

	isCollapsed(groupBy, key) {
		return (this.collapsed[groupBy] ?? []).includes(key);
	}

	toggle(groupBy, key) {
		let current = this.collapsed[groupBy] ?? [];
		let next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
		this.collapsed = { ...this.collapsed, [groupBy]: next };
	}
}
