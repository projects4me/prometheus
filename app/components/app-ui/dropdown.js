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
 * <AppUi::Dropdown>
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

	/**
	 * Toggles the dropdown's visibility.
	 *
	 * @method toggleDropdown
	 * @public
	 * @action
	 */
	@action
	toggleDropdown() {
		this.isOpen = !this.isOpen;
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
	}
}
