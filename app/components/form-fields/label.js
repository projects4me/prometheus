/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

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
	 * Remembers which info bubbles are hidden
	 *
	 * @property fieldInfo
	 * @type FieldInfo
	 * @for FormFieldsLabelComponent
	 */
	@service fieldInfo;

	/**
	 * Key that identifies this field's bubble: @infoKey, or else @data-field.
	 *
	 * @property infoKey
	 * @type String
	 */
	get infoKey() {
		return this.args.infoKey || this.args['data-field'];
	}

	/**
	 * Whether the user has hidden the info bubble of this field.
	 *
	 * @property isInfoHidden
	 * @type Boolean
	 */
	get isInfoHidden() {
		return this.fieldInfo.isHidden(this.infoKey);
	}

	/**
	 * This function toggles the information of the label and saves the choice.
	 *
	 * @method toggleInfo
	 */
	@action
	toggleInfo() {
		this.fieldInfo.toggle(this.infoKey);
	}
}
