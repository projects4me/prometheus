/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render the application footer
 *
 * @class AppLayoutsApplicationFooterComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppLayoutsApplicationFooterComponent extends Component {
	/**
	 * This property returns the current year.
	 *
	 * @property currentYear
	 * @for AppLayoutsApplicationFooterComponent
	 */
	get currentYear() {
		let currentYear = new Date().getFullYear();
		return currentYear;
	}
}
