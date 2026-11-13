/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The fixture options of the demo.
 *
 * @property OPTIONS
 * @type Array
 * @private
 */
const OPTIONS = [
	{ value: 'aprom', label: 'A Prometheus' },
	{ value: 'agaia', label: 'A Gaia' },
	{ value: 'ah', label: 'A Hermes' },
	{ value: 'aa', label: 'A Ares' },
];

/**
 * The AppUi::Select demo of the Component Library. It holds the demo's controls (multiple, search,
 * allow clear, disabled) and logs change, open and close to the entry's event log.
 *
 * @class DeveloperDemosSelectComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosSelectComponent extends Component {
	@tracked multiple = false;
	@tracked searchEnabled = true;
	@tracked allowClear = false;
	@tracked disabled = false;
	@tracked selected = null;
	@tracked selectedMany = [];

	options = OPTIONS;

	/**
	 * Logs and keeps the chosen option (or options, for a multiple select).
	 *
	 * @method change
	 * @param {Object} log the entry's event log
	 * @param {Object|Array} selection the chosen option, or options when multiple
	 */
	@action
	change(log, selection) {
		if (this.multiple) {
			this.selectedMany = selection;
			log.log('change', selection.map((option) => option.value).join(', '));
		} else {
			this.selected = selection;
			log.log('change', selection ? selection.value : 'cleared');
		}
	}

	@action
	opened(log) {
		log.log('open');
	}

	@action
	closed(log) {
		log.log('close');
	}

	/**
	 * Flips one of the boolean controls.
	 *
	 * @method toggle
	 * @param {String} name the control's property
	 * @param {Event} event the checkbox change event
	 */
	@action
	toggle(name, event) {
		this[name] = event.target.checked;
	}

	@action
	reset() {
		this.multiple = false;
		this.searchEnabled = true;
		this.allowClear = false;
		this.disabled = false;
		this.selected = null;
		this.selectedMany = [];
	}
}
