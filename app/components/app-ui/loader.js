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
	 * The words of the icon argument: today's values such as "fa-spinner fa-spin" stay accepted.
	 * @property iconWords
	 * @type {Array<string>}
	 * @private
	 */
	get iconWords() {
		return (this.args.icon || 'spinner spin').split(/\s+/).filter((word) => word && word !== 'fa');
	}

	/**
	 * The bare icon name of the spinner (the AppUi::Icon component strips a leading fa-)
	 * @property iconName
	 * @type {string}
	 * @default "spinner"
	 * @public
	 */
	get iconName() {
		return this.iconWords.find((word) => !/^(fa-)?spin$/.test(word)) || 'spinner';
	}

	/**
	 * Whether the icon spins
	 * @property iconSpin
	 * @type {boolean}
	 * @default true
	 * @public
	 */
	get iconSpin() {
		return this.iconWords.some((word) => /^(fa-)?spin$/.test(word));
	}
}
