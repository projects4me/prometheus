/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { postToast } from 'prometheus/utils/ui/post-toast';

/**
 * Base class for user profile sections that add, validate, save, and remove
 * child records on a user (for example skills or qualifications).
 *
 * Subclasses supply Yup schema and Ember Data configuration through getters
 * (`schemaName`, `fieldNames`, `recordType`, `relationshipKey`, toast keys).
 * Templates invoke shared actions (`startAdding`, `cancelAdding`, `saveDraft`,
 * `removeItem`) and may alias `draft` via a domain-specific getter such as
 * `newSkill` or `newQualification`.
 *
 * **Arguments** (passed from `AppUserPageController` via the page template)
 * - `@user` — Profile user model; draft records are linked to `user.skills` or
 *   `user.qualifications` after save.
 * - `@save` — Controller `save` action for Yup validation and persistence.
 * - `@validateField` — Per-field validation on blur.
 * - `@clearFieldMessage` — Clears validation messages when the form opens or closes.
 * - `@message` — Validation message object keyed by schema and field name.
 * - `@selectRelated` — Optional; used by `FieldRelate` fields in subclass templates.
 *
 * @class UserProfileBaseInlineSectionComponent
 * @namespace Prometheus.Components.UserProfile
 * @extends Glimmer.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfileBaseInlineSectionComponent extends Component {
	/**
	 * Internationalization service for option labels and toasts.
	 *
	 * @property intl
	 * @type Ember.Service
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@service intl;

	/**
	 * Access control service for edit permissions on the profile.
	 *
	 * @property acl
	 * @type Ember.Service
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@service acl;

	/**
	 * Ember Data store used to create draft records.
	 *
	 * @property store
	 * @type Ember.Service
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@service store;

	/**
	 * Whether the inline add form is visible.
	 *
	 * @property isAdding
	 * @type Boolean
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@tracked isAdding = false;

	/**
	 * Whether a save or remove request is in progress.
	 *
	 * @property isSaving
	 * @type Boolean
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@tracked isSaving = false;

	/**
	 * Ember Data record being created in the inline form, or `null` when idle.
	 *
	 * @property draft
	 * @type {Object|null}
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	@tracked draft = null;

	/**
	 * Yup schema section name passed to `@save` and `@validateField`.
	 *
	 * @property schemaName
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get schemaName() {
		throw new Error('schemaName must be defined on the subclass');
	}

	/**
	 * Field names cleared and validated for the inline form.
	 *
	 * @property fieldNames
	 * @type Array
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get fieldNames() {
		return [];
	}

	/**
	 * Ember Data model name used with `store.createRecord`.
	 *
	 * @property recordType
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get recordType() {
		throw new Error('recordType must be defined on the subclass');
	}

	/**
	 * Has-many relationship key on `@user` (for example `skills` or `qualifications`).
	 *
	 * @property relationshipKey
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get relationshipKey() {
		throw new Error('relationshipKey must be defined on the subclass');
	}

	/**
	 * Module name passed to the controller save flow for error display.
	 *
	 * @property saveModule
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get saveModule() {
		return 'user';
	}

	/**
	 * i18n key for a successful save or remove toast.
	 *
	 * @property toastSavedKey
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get toastSavedKey() {
		throw new Error('toastSavedKey must be defined on the subclass');
	}

	/**
	 * i18n key for a failed remove toast.
	 *
	 * @property toastSaveFailedKey
	 * @type String
	 * @for UserProfileBaseInlineSectionComponent
	 * @protected
	 */
	get toastSaveFailedKey() {
		throw new Error('toastSaveFailedKey must be defined on the subclass');
	}

	/**
	 * Whether the current user may edit profile collections.
	 *
	 * @property canEdit
	 * @type Boolean
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	get canEdit() {
		return this.acl.checkAccess('App.User.Edit');
	}

	/**
	 * Whether the dotted add control should be shown in the section header.
	 *
	 * @property showAddControl
	 * @type Boolean
	 * @for UserProfileBaseInlineSectionComponent
	 * @public
	 */
	get showAddControl() {
		return this.canEdit && !this.isAdding;
	}

	/**
	 * Maps static definitions to relate-simple / PowerSelect options with translated labels.
	 *
	 * @method buildIntlOptions
	 * @param {Array} definitions
	 * @return {Array}
	 * @protected
	 */
	buildIntlOptions(definitions) {
		return definitions.map(({ value, labelKey }) => ({
			value,
			label: this.intl.t(labelKey),
		}));
	}

	/**
	 * Builds a value-to-label map from relate-simple options.
	 *
	 * @method buildLabelMap
	 * @param {Array} options
	 * @return {Object}
	 * @protected
	 */
	buildLabelMap(options) {
		return Object.fromEntries(
			options.map(({ value, label }) => [value, label])
		);
	}

	/**
	 * Returns the selected option object for a relate-simple field value.
	 *
	 * @method findSelectedOption
	 * @param {Array} options
	 * @param {*} fieldValue
	 * @return {Object|null}
	 * @protected
	 */
	findSelectedOption(options, fieldValue) {
		return options.find((option) => option.value === fieldValue) ?? null;
	}

	/**
	 * Builds year options for completion year relate-simple fields.
	 *
	 * @method buildYearOptions
	 * @param {Number} minYear
	 * @param {Number} maxYear
	 * @return {Array}
	 * @protected
	 */
	buildYearOptions(minYear, maxYear) {
		const years = [];

		for (let year = maxYear; year >= minYear; year--) {
			years.push({ value: year, label: String(year) });
		}

		return years;
	}

	/**
	 * Opens the inline form and creates a new draft record for the profile user.
	 *
	 * @method startAdding
	 * @param {Event} event
	 * @public
	 */
	@action
	startAdding(event) {
		event?.preventDefault();
		this.isAdding = true;
		this.draft = this.store.createRecord(this.recordType, {
			userId: this.args.user.id,
		});
		this.clearFieldMessages();
	}

	/**
	 * Closes the inline form and rolls back an unsaved draft record.
	 *
	 * @method cancelAdding
	 * @public
	 */
	@action
	cancelAdding() {
		if (this.draft?.isNew) {
			this.draft.deleteRecord();
		}

		this.isAdding = false;
		this.draft = null;
		this.clearFieldMessages();
	}

	/**
	 * Updates a text attribute on the draft record from an input event.
	 *
	 * @method updateDraftField
	 * @param {String} field
	 * @param {Event} event
	 * @public
	 */
	@action
	updateDraftField(field, event) {
		this.draft?.set(field, event.target.value);
	}

	/**
	 * Validates and saves the draft record, then links it to the profile user.
	 *
	 * @method saveDraft
	 * @public
	 */
	@action
	async saveDraft() {
		this.isSaving = true;

		try {
			await this.args.save(
				this.schemaName,
				this.saveModule,
				this.draft,
				false
			);
			this.linkDraftToUser();
			postToast(this.intl, this.toastSavedKey);
			this.isAdding = false;
			this.draft = null;
		} catch {
			// Validation and API errors are handled by the controller save flow.
		} finally {
			this.isSaving = false;
		}
	}

	/**
	 * Deletes a persisted collection item and shows success or error feedback.
	 *
	 * @method removeItem
	 * @param {Object} record
	 * @public
	 */
	@action
	async removeItem(record) {
		this.isSaving = true;

		try {
			await record.destroyRecord();
			postToast(this.intl, this.toastSavedKey);
		} catch {
			record.rollbackAttributes();
			postToast(this.intl, this.toastSaveFailedKey, 'error');
		} finally {
			this.isSaving = false;
		}
	}

	/**
	 * Associates the saved draft with `@user` and adds it to the has-many collection.
	 *
	 * @method linkDraftToUser
	 * @protected
	 */
	linkDraftToUser() {
		const { user } = this.args;
		const collection = user[this.relationshipKey];

		this.draft.set('user', user);

		if (!collection.includes(this.draft)) {
			collection.pushObject(this.draft);
		}
	}

	/**
	 * Clears validation messages for all fields on the subclass schema.
	 *
	 * @method clearFieldMessages
	 * @protected
	 */
	clearFieldMessages() {
		for (const fieldName of this.fieldNames) {
			this.args.clearFieldMessage?.(this.schemaName, fieldName);
		}
	}
}
