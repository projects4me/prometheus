import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The fields shown by the picker, in order.
 *
 * @property FIELDS
 * @type {Array<string>}
 * @public
 */
export const FIELDS = [
	'FieldText',
	'FieldTextArea',
	'FieldRelate',
	'FieldRelateMulti',
	'FieldMultiSelect',
	'FieldDate',
	'FieldCheckbox',
	'FieldSwitch',
	'FieldUpload',
	'FieldSearch'
];

/**
 * Fixture users for the relate fields.
 *
 * @property USERS
 * @type {Array<Object>}
 * @public
 */
export const USERS = [
	{ value: 'u1', label: 'Ada Lovelace' },
	{ value: 'u2', label: 'Grace Hopper' },
	{ value: 'u3', label: 'Alan Turing' },
	{ value: 'u4', label: 'Margaret Hamilton' }
];

/**
 * Fixture options for the multi select field.
 *
 * @property TAGS
 * @type {Array<string>}
 * @public
 */
export const TAGS = ['bug', 'feature', 'task', 'epic'];

const MULTI = ['FieldRelateMulti', 'FieldMultiSelect'];

/**
 * Demo of the FormFields::* components: a picker, common controls, the
 * current value and an event log.
 *
 * @class DeveloperDemosFormFields
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperDemosFormFieldsComponent extends Component {
	fields = FIELDS;

	users = USERS;

	tags = TAGS;

	@tracked field = FIELDS[0];

	@tracked disabled = false;

	@tracked readonly = false;

	@tracked showError = false;

	@tracked searchEnabled = true;

	@tracked placeholder = 'Type here';

	@tracked value = '';

	@tracked selected = null;

	@tracked checked = false;

	@tracked fileName = null;

	@tracked searchText = '';

	get message() {
		return this.showError ? 'This field is invalid' : null;
	}

	get hasSearchOption() {
		return ['FieldRelate', ...MULTI].includes(this.field);
	}

	/**
	 * The current value of the picked field, as text.
	 *
	 * @property valueText
	 * @type {string}
	 */
	get valueText() {
		switch (this.field) {
			case 'FieldRelate':
				return this.selected ? this.selected.label : '';
			case 'FieldRelateMulti':
				return (this.selected || []).map(user => user.label).join(', ');
			case 'FieldMultiSelect':
				return (this.selected || []).join(', ');
			case 'FieldCheckbox':
			case 'FieldSwitch':
				return String(this.checked);
			case 'FieldUpload':
				return this.fileName || '';
			case 'FieldSearch':
				return this.searchText;
			default:
				return this.value || '';
		}
	}

	@action
	pick(field) {
		this.field = field;
		this.resetValues();
	}

	@action
	reset() {
		this.resetValues();
		this.disabled = false;
		this.readonly = false;
		this.showError = false;
		this.searchEnabled = true;
		this.placeholder = 'Type here';
	}

	resetValues() {
		this.value = '';
		this.selected = MULTI.includes(this.field) ? [] : null;
		this.checked = false;
		this.fileName = null;
		this.searchText = '';
	}

	@action
	toggle(name) {
		this[name] = !this[name];
	}

	@action
	setPlaceholder(event) {
		this.placeholder = event.target.value;
	}

	@action
	validate(log) {
		log.log('validate', this.field);
	}

	@action
	onInput(log, event) {
		this.value = event?.target ? event.target.value : event;
		log.log('input', this.value);
	}

	@action
	onSelect(log, selected) {
		this.selected = selected;
		log.log('change', this.valueText);
	}

	@action
	onDate(log, value) {
		this.value = value;
		log.log('update', value);
	}

	@action
	onCheck(log, event) {
		this.checked = event.target.checked;
		log.log('select', this.checked);
	}

	@action
	onUpload(log, file) {
		this.fileName = file?.name ?? null;
		log.log('upload', this.fileName);
		// the file is only logged, never uploaded
		file?.queue?.remove?.(file);
	}

	@action
	onSearch(log, text) {
		this.searchText = text;
		log.log('search', text);
	}
}
