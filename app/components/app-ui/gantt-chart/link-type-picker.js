/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * The relations the picker offers, in order. `relation` is what issueRelations.link() takes.
 *
 * @property RELATIONS
 * @type Object[]
 * @private
 */
const RELATIONS = [
	{ relation: 'blocks', key: 'blocks' },
	{ relation: 'splitsInto', key: 'splitsInto' },
	{ relation: 'relates', key: 'relates' }
];

/**
 * The small picker shown at the drop point of a link dot: the link type between `@source` and `@target`.
 * It only displays the options and reports the choice (`@onSelect(relation)`) or the cancel (`@onCancel()`: Esc or a
 * click outside); saving the link is the caller's job.
 *
 * @class LinkTypePicker
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Glimmer.Component
 */
export default class LinkTypePickerComponent extends Component {
	/**
	 * @property relations
	 * @type Object[]
	 */
	relations = RELATIONS;

	/**
	 * The inline position of the picker, at the drop point.
	 *
	 * @property style
	 * @type String
	 */
	get style() {
		return `left: ${Math.round(this.args.x || 0)}px; top: ${Math.round(this.args.y || 0)}px;`;
	}

	/**
	 * Focuses the first option and listens for Esc and outside clicks while the picker is open.
	 *
	 * @method setup
	 * @param {HTMLElement} element
	 */
	@action setup(element) {
		this.element = element;
		this.onKeyDown = (event) => {
			if (event.key === 'Escape') {
				this.args.onCancel?.();
			}
		};
		this.onOutside = (event) => {
			if (!this.element.contains(event.target)) {
				this.args.onCancel?.();
			}
		};
		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('mousedown', this.onOutside, true);
		element.querySelector('input')?.focus();
	}

	/**
	 * Stops listening.
	 *
	 * @method willDestroy
	 */
	willDestroy() {
		super.willDestroy(...arguments);
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('mousedown', this.onOutside, true);
	}

	/**
	 * Reports the chosen relation.
	 *
	 * @method choose
	 * @param {String} relation
	 */
	@action choose(relation) {
		this.args.onSelect?.(relation);
	}
}
