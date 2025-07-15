/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';

/**
 * This component is used to render an accordion with collapsible sections.
 *
 * @class AppUiAccordionComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiAccordionComponent extends Component {
	/**
	 * This property tracks the open sections using an array instead of Set.
	 *
	 * @property openSections
	 * @type Array
	 * @for AppUiAccordionComponent
	 */
	@tracked openSections = [];

	/**
	 * This property returns the sections to be rendered.
	 *
	 * @property sections
	 * @type Array
	 * @for AppUiAccordionComponent
	 */
	get sections() {
		scheduleOnce('afterRender', this, () => {
			this.openSections = [];
		});
		return this.args.sections;
	}

	/**
	 * This function toggles the open state of a section.
	 *
	 * @method toggleSection
	 * @for AppUiAccordionComponent
	 * @public
	 */
	@action toggleSection(section, index) {
		const { canOpenMultipleSections = false, onToggle } = this.args;

		if (canOpenMultipleSections) {
			// Multiple sections can be open at once
			if (this.openSections.includes(index)) {
				this.openSections = this.openSections.filter(
					(i) => i !== index
				);
			} else {
				this.openSections = [...this.openSections, index];
			}
		} else {
			// Single accordion behavior - only one section open at a time
			if (this.openSections.includes(index)) {
				this.openSections = [];
			} else {
				this.openSections = [index];
			}
		}

		// Call the onToggle callback if provided
		if (onToggle) {
			onToggle(section, index, this.openSections.includes(index));
		}
	}

	/**
	 * This function handles keyboard navigation for accessibility.
	 *
	 * @method handleKeydown
	 * @for AppUiAccordionComponent
	 * @public
	 */
	@action handleKeydown(section, index, event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.toggleSection(section, index);
		}
	}
}
