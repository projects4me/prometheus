/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Base component for all widget components in the application.
 * Provides common functionality for widget components including field translation
 * and sortable widget containers.
 *
 * @class WidgetsComponent
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class WidgetsComponent extends Component {
	/**
	 * The internationalization service for handling translations
	 * @property intl
	 * @type {Prometheus.Services.intl}
	 * @private
	 */
	@service intl;

	/**
     * This is the store service which is used to interact with the data API.
     *
     * @property store
     * @type Ember.Service
     * @for App
     * @protected
     */
	@service store;

	/**
	 * The current user service
	 * @property currentUser
	 * @type {Prometheus.Services.currentUser}
	 * for App
	 * @protected
	 */
	@service currentUser;

	/**
	 * Processes and formats the fields configuration from widgetSettings
	 * Translates field labels using the provided translationKey
	 *
	 * @property fields
	 * @type {Array}
	 * @public
	 * @returns {Array} Array of field objects with translated labels and value keys
	 */
	get fields() {
		let widgetSettings = this.args.widgetSettings;
		let translationKey = widgetSettings.translationKey;
		let fields = [];
		widgetSettings.fields.forEach((field) => {
			if (field.label) {
				fields.push({
					label: this.intl.t(`${translationKey}.${field.label}`),
					valueKey: field.valueKey
				});
			} else {
				fields.push({
					label: this.intl.t(`${translationKey}.${field}`),
					valueKey: field
				});
			}
		});
		return fields;
	}

	/**
	 * Initializes jQuery UI sortable functionality for widget containers
	 * Makes widget containers draggable and sortable
	 *
	 * @method initSortable
	 * @public
	 * @action
	 */
	@action
	initSortable() {
		$('.connectedSortable').sortable({
			placeholder: 'sort-highlight',
			connectWith: '.connectedSortable',
			handle: '.box-header, .nav-tabs',
			forcePlaceholderSize: true,
			zIndex: 999999
		});
		$(
			'.connectedSortable .box-header, .connectedSortable .nav-tabs-custom'
		).css('cursor', 'move');
	}
}
