/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * A reusable toolbar component with caret down dropdown functionality.
 * This component provides a toolbar with the ability to show/hide additional actions
 * through a caret down dropdown.
 *
 * @class AppUiToolbarComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <AppUi::Toolbar @showCaret={{true}}>
 *   <:primary>
 *     <AppUi::Button><i class="fa fa-pencil"></i></AppUi::Button>
 *   </:primary>
 *   <:dropdown>
 *     <AppUi::Button><i class="fa fa-copy"></i></AppUi::Button>
 *     <AppUi::Button><i class="fa fa-download"></i></AppUi::Button>
 *   </:dropdown>
 * </AppUi::Toolbar>
 */
export default class AppUiToolbarComponent extends Component {
	/**
	 * Controls the visibility of the dropdown.
	 * @property isDropdownOpen
	 * @type {boolean}
	 * @default false
	 * @public
	 */
	@tracked isDropdownOpen = false;

	/**
	 * Whether to show the caret down button
	 * @property showCaret
	 * @type {boolean}
	 * @default false
	 * @public
	 */
	get showCaret() {
		return this.args.showCaret || false;
	}

	/**
	 * Toggles the dropdown's visibility.
	 *
	 * @method toggleDropdown
	 * @public
	 * @action
	 */
	@action
	toggleDropdown() {
		this.isDropdownOpen = !this.isDropdownOpen;
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
		this.isDropdownOpen = false;
	}
}
