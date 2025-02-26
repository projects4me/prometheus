/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component renders label for the fields.
 *
 * @class FormFieldsLabelComponent
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FormFieldsLabelComponent extends Component {
	/**
	 * This function toggle the information of the label.
	 *
	 * @method toggleLabelInfo
	 */
	toggleLabelInfo(fieldName, event) {
		let infoEl = document.querySelector(
			`[data-field="${fieldName}"] [data-field-label="info"]`
		);
		let el = document.querySelector(
			`[data-field="${fieldName}"] [data-field-label="info"]`
		);
		// data-label-info="btn"
		if (infoEl.style.display === 'none') {
			infoEl.style.display = 'inline-flex';
		} else {
			infoEl.style.display = 'none';
		}
	}
}
