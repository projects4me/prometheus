/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * A reusable dropdown component.
 * This component provides basic dropdown functionality, including opening, closing, and handling outside clicks.
 *
 * @class AppUiDropdownComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <AppUi::Dropdown @align="auto">
 *   <:button>
 *     Click me
 *   </:button>
 *   <:content>
 *     <a href="#">Item 1</a>
 *     <a href="#">Item 2</a>
 *   </:content>
 * </AppUi::Dropdown>
 */
export default class AppUiDropdownComponent extends Component {
	/**
	 * Controls the visibility of the dropdown.
	 * @property isOpen
	 * @type {boolean}
	 * @default false
	 * @public
	 */
	@tracked isOpen = false;

	/** The alignment measured on open when @align is auto: start or end. */
	@tracked measuredAlign = 'start';

	/** True when the menu has no room below the trigger and opens upward. */
	@tracked opensUp = false;

	trigger = null;
	menu = null;

	/**
	 * The alignment in use: the @align argument, or the measured one for auto.
	 *
	 * @property resolvedAlign
	 * @type {string}
	 */
	get resolvedAlign() {
		let align = this.args.align || 'auto';
		return align === 'auto' ? this.measuredAlign : align;
	}

	/**
	 * Toggles the dropdown's visibility.
	 *
	 * @method toggleDropdown
	 * @public
	 * @action
	 */
	@action
	toggleDropdown(event) {
		if (this.isOpen) {
			this.closeDropdown();
		} else {
			this.open(event.currentTarget);
		}
	}

	/**
	 * Opens the menu. The menu is measured before it is shown, so it never appears in the wrong place:
	 * it is displayed for the measurement only, in the same frame.
	 *
	 * @method open
	 * @param {HTMLElement} trigger the button that was clicked
	 */
	open(trigger) {
		this.trigger = trigger;
		this.menu = trigger.nextElementSibling;
		this.menu.classList.add('show');
		this.isOpen = true;
		this.measure();
		window.addEventListener('resize', this.measure);
		document.addEventListener('keydown', this.onKeydown);
	}

	/**
	 * Closes the dropdown.
	 *
	 * @method closeDropdown
	 * @public
	 * @action
	 */
	@action
	closeDropdown() {
		this.isOpen = false;
		this.stopListening();
	}

	stopListening() {
		window.removeEventListener('resize', this.measure);
		document.removeEventListener('keydown', this.onKeydown);
	}

	/** Closes on Escape and returns the focus to the trigger. */
	onKeydown = (event) => {
		if (event.key === 'Escape' && this.isOpen) {
			this.closeDropdown();
			this.trigger?.focus();
		}
	};

	/**
	 * Measures the trigger and the menu against the viewport: for auto, start when the menu fits to the
	 * right of the trigger's left edge, otherwise end; the menu opens upward when it does not fit below
	 * but fits above.
	 *
	 * @method measure
	 */
	measure = () => {
		if (this.isDestroying || this.isDestroyed || !this.isOpen) {
			return;
		}
		let trigger = this.trigger.getBoundingClientRect();
		let menu = this.menu.getBoundingClientRect();
		let viewportWidth = window.innerWidth;
		let viewportHeight = window.innerHeight;

		this.measuredAlign = trigger.left + menu.width <= viewportWidth ? 'start' : 'end';
		this.opensUp =
			trigger.bottom + menu.height > viewportHeight && trigger.top - menu.height >= 0;
	};

	willDestroy() {
		super.willDestroy(...arguments);
		this.stopListening();
	}
}
