/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component provides a consistent loading indicator that can be used
 * in different contexts (overlay, inline, etc.)
 *
 * @class AppUiLoaderComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * <AppUi::Loader @message="Loading..." @variant="overlay" />
 * <AppUi::Loader @message="Loading data..." @variant="inline" />
 */
export default class AppUiLoaderComponent extends Component {
	/**
	 * Get the variant type for the loader
	 * @property variant
	 * @type {string}
	 * @default "inline"
	 * @public
	 */
	get variant() {
		return this.args.variant || 'inline';
	}

	/**
	 * Get the icon class for the spinner
	 * @property iconClass
	 * @type {string}
	 * @default "fa-spinner fa-spin"
	 * @public
	 */
	get iconClass() {
		return this.args.icon || 'fa-spinner fa-spin';
	}
}
