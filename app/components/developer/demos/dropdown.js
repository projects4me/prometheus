/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const LONG_LABEL =
	'A saved search with a very long name that has to wrap instead of running off the screen';

/**
 * The AppUi::Dropdown demo of the Component Library. It holds the demo's controls (placement, scoped
 * alignment, item count) and logs open, close and item-chosen events to the entry's event log.
 *
 * @class DeveloperDemosDropdownComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosDropdownComponent extends Component {
	@tracked placement = 'left';
	@tracked scoped = false;
	@tracked many = false;
	@tracked selected = 'recent';

	placements = ['left', 'right'];

	observer = null;

	/**
	 * The fixture items: plain, with icons, a selected one, a divider and a long label.
	 *
	 * @property items
	 * @type Array
	 */
	get items() {
		let items = [
			{ key: 'recent', label: 'Recent issues', icon: 'fa-clock-o' },
			{ key: 'mine', label: 'Assigned to me', icon: 'fa-user' },
			{ key: 'plain', label: 'Plain item' },
			{ divider: true },
			{ key: 'long', label: LONG_LABEL, long: true },
		];
		if (this.many) {
			for (let i = 1; i <= 20; i++) {
				items.push({ key: `extra-${i}`, label: `Extra item ${i}` });
			}
		}
		return items.map((item) => ({ ...item, active: item.key === this.selected }));
	}

	/**
	 * The classes of the demo box: placement, scoped alignment and scrolling.
	 *
	 * @property boxClass
	 * @type String
	 */
	get boxClass() {
		return [
			'dropdown-demo-box',
			`is-${this.placement}`,
			this.scoped ? 'is-scoped' : '',
			this.many ? 'is-scroll' : '',
		]
			.filter(Boolean)
			.join(' ');
	}

	@action
	setPlacement(placement) {
		this.placement = placement;
	}

	@action
	setScoped(event) {
		this.scoped = event.target.checked;
	}

	@action
	setMany(event) {
		this.many = event.target.checked;
	}

	/**
	 * Watches the dropdown's content for the `show` class and logs open and close. The dropdown has no
	 * callbacks, so the demo observes the DOM; this also catches closes from a click outside.
	 *
	 * @method watch
	 * @param {Object} log the entry's event log
	 * @param {HTMLElement} element the demo box
	 */
	@action
	watch(log, element) {
		let content = element.querySelector('.app-dropdown-content');
		if (!content) {
			return;
		}
		if (this.observer) {
			this.observer.disconnect();
		}
		let wasOpen = content.classList.contains('show');
		this.observer = new MutationObserver(() => {
			let open = content.classList.contains('show');
			if (open !== wasOpen) {
				wasOpen = open;
				log.log(open ? 'open' : 'close');
			}
		});
		this.observer.observe(content, { attributes: true, attributeFilter: ['class'] });
	}

	/**
	 * Marks the chosen item and logs it. The menu stays open, as the dropdown itself does.
	 *
	 * @method choose
	 * @param {Object} log the entry's event log
	 * @param {Object} item the chosen item
	 */
	@action
	choose(log, item) {
		this.selected = item.key;
		log.log('item chosen', item.key);
	}

	@action
	reset() {
		this.placement = 'left';
		this.scoped = false;
		this.many = false;
		this.selected = 'recent';
	}

	willDestroy() {
		super.willDestroy(...arguments);
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}
