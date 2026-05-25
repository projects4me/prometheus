/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import UserProfileBaseInlineSectionComponent from 'prometheus/components/user-profile/base-inline-section';

const MIN_COMPLETION_YEAR = 1965;
const QUALIFICATION_TYPE_DEFINITIONS = [
	{
		value: 'education',
		labelKey: 'views.app.user.page.qualification.typeEducation',
		iconClass: 'fa-graduation-cap',
	},
	{
		value: 'certification',
		labelKey: 'views.app.user.page.qualification.typeCertification',
		iconClass: 'fa-certificate',
	},
];

/**
 * Renders the Qualifications box on the user profile: a list of qualifications with
 * type icons, and an inline form to add education or certification entries.
 *
 * Validation uses the `userQualification` schema on `AppUserPageController`.
 * List items are not shown until a record is saved; the draft is held on `draft`
 * (exposed as `newQualification` in the template). The list is rendered from
 * `sortedQualifications`, ordered by `completionYear` descending.
 *
 * @class UserProfileQualificationComponent
 * @namespace Prometheus.Components.UserProfile
 * @extends UserProfileBaseInlineSectionComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfileQualificationComponent extends UserProfileBaseInlineSectionComponent {
	/**
	 * Yup schema section name for qualification fields.
	 *
	 * @property schemaName
	 * @type String
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get schemaName() {
		return 'userQualification';
	}

	/**
	 * Fields validated and cleared for the qualification form.
	 *
	 * @property fieldNames
	 * @type Array
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get fieldNames() {
		return ['type', 'title', 'institution', 'completionYear'];
	}

	/**
	 * Ember Data model name for a qualification record.
	 *
	 * @property recordType
	 * @type String
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get recordType() {
		return 'userqualification';
	}

	/**
	 * Has-many key on the profile user model.
	 *
	 * @property relationshipKey
	 * @type String
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get relationshipKey() {
		return 'qualifications';
	}

	/**
	 * i18n key for save and remove success toasts.
	 *
	 * @property toastSavedKey
	 * @type String
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get toastSavedKey() {
		return 'views.app.user.page.qualification.saved';
	}

	/**
	 * i18n key for remove failure toasts.
	 *
	 * @property toastSaveFailedKey
	 * @type String
	 * @for UserProfileQualificationComponent
	 * @protected
	 */
	get toastSaveFailedKey() {
		return 'views.app.user.page.qualification.saveFailed';
	}

	/**
	 * Alias of `draft` for the qualification form and list template.
	 *
	 * @property newQualification
	 * @type {Prometheus.Models.Userqualification|null}
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get newQualification() {
		return this.draft;
	}

	/**
	 * Qualifications for the list, newest completion year first.
	 *
	 * @property sortedQualifications
	 * @type Array
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get sortedQualifications() {
		const qualifications =
			this.args.user?.qualifications?.toArray?.() ??
			this.args.user?.qualifications ??
			[];

		return [...qualifications].sort(
			(a, b) => (b.completionYear ?? 0) - (a.completionYear ?? 0)
		);
	}

	/**
	 * Type options for the qualification form relate-simple field.
	 *
	 * @property typeOptions
	 * @type Array
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get typeOptions() {
		return this.buildIntlOptions(QUALIFICATION_TYPE_DEFINITIONS);
	}

	/**
	 * Full type labels keyed by type value for list item tooltips.
	 *
	 * @property typeLabels
	 * @type Object
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get typeLabels() {
		return this.buildLabelMap(this.typeOptions);
	}

	/**
	 * Font Awesome icon classes keyed by qualification type for the list.
	 *
	 * @property typeIcons
	 * @type Object
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get typeIcons() {
		return Object.fromEntries(
			QUALIFICATION_TYPE_DEFINITIONS.map(({ value, iconClass }) => [
				value,
				iconClass,
			])
		);
	}

	/**
	 * Selected type option for the draft qualification form.
	 *
	 * @property selectedType
	 * @type {Object|null}
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get selectedType() {
		return this.findSelectedOption(
			this.typeOptions,
			this.newQualification?.type
		);
	}

	/**
	 * Completion year options for the draft qualification form.
	 *
	 * @property completionYearOptions
	 * @type Array
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get completionYearOptions() {
		return this.buildYearOptions(
			MIN_COMPLETION_YEAR,
			moment().year()
		);
	}

	/**
	 * Selected completion year option for the draft qualification form.
	 *
	 * @property selectedCompletionYear
	 * @type {Object|null}
	 * @for UserProfileQualificationComponent
	 * @public
	 */
	get selectedCompletionYear() {
		return this.findSelectedOption(
			this.completionYearOptions,
			this.newQualification?.completionYear
		);
	}
}
