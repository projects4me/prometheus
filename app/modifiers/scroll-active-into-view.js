/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

/**
 * Scrolls the element matching `[data-issue-id]` of the active id into view when the id changes
 * (not on the first render). Waits a frame so a group that is expanding has rendered its rows.
 *
 * Usage: `<div {{scroll-active-into-view @activeId}}>`
 *
 * @class ScrollActiveIntoViewModifier
 * @extends Modifier
 */
export default class ScrollActiveIntoViewModifier extends Modifier {
	rendered = false;

	value;

	modify(element, [id]) {
		let changed = this.rendered && id !== this.value;
		this.rendered = true;
		this.value = id;
		if (!changed || id === undefined || id === null) {
			return;
		}
		requestAnimationFrame(() => {
			if (!element.isConnected) {
				return;
			}
			element.querySelector(`[data-issue-id="${CSS.escape(String(id))}"]`)?.scrollIntoView?.({ block: 'nearest' });
		});
	}
}
