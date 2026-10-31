/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import UserProfileBaseInlineSectionComponent from 'prometheus/components/user-profile/base-inline-section';

const PROVIDER_DEFINITIONS = [
	{ value: 'git', labelKey: 'views.app.user.page.identity.providerGit' },
	{ value: 'github', labelKey: 'views.app.user.page.identity.providerGithub' },
	{ value: 'gitlab', labelKey: 'views.app.user.page.identity.providerGitlab' },
	{ value: 'slack', labelKey: 'views.app.user.page.identity.providerSlack' },
	{ value: 'ssh', labelKey: 'views.app.user.page.identity.providerSsh' },
];

/**
 * Renders the Identities box on a user or agent profile: saved identities
 * (provider, handle, email, key fingerprint, verified flag) and an inline form
 * to add one. The verified flag is display-only.
 *
 * @class UserProfileIdentitiesComponent
 * @namespace Prometheus.Components.UserProfile
 * @extends UserProfileBaseInlineSectionComponent
 */
export default class UserProfileIdentitiesComponent extends UserProfileBaseInlineSectionComponent {
	/**
	 * Yup schema section name for identity fields.
	 *
	 * @property schemaName
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get schemaName() {
		return 'userIdentity';
	}

	/**
	 * Fields validated and cleared for the identity form.
	 *
	 * @property fieldNames
	 * @type Array
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get fieldNames() {
		return ['provider', 'handle', 'email'];
	}

	/**
	 * Ember Data model name for an identity record.
	 *
	 * @property recordType
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get recordType() {
		return 'useridentity';
	}

	/**
	 * Has-many key on the profile user model.
	 *
	 * @property relationshipKey
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get relationshipKey() {
		return 'identities';
	}

	/**
	 * i18n key for the save success toast.
	 *
	 * @property toastSavedKey
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get toastSavedKey() {
		return 'views.app.user.page.identity.saved';
	}

	/**
	 * i18n key for the save failure toast.
	 *
	 * @property toastSaveFailedKey
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get toastSaveFailedKey() {
		return 'views.app.user.page.identity.saveFailed';
	}

	/**
	 * i18n key for the remove success toast.
	 *
	 * @property toastRemoveSuccessKey
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get toastRemoveSuccessKey() {
		return 'views.app.user.page.identity.removed';
	}

	/**
	 * i18n key for the remove failure toast.
	 *
	 * @property toastRemoveFailedKey
	 * @type String
	 * @for UserProfileIdentitiesComponent
	 * @protected
	 */
	get toastRemoveFailedKey() {
		return 'views.app.user.page.identity.removeFailed';
	}

	/**
	 * Alias of `draft` for the identity form template.
	 *
	 * @property newIdentity
	 * @type {Prometheus.Models.Useridentity|null}
	 * @for UserProfileIdentitiesComponent
	 * @public
	 */
	get newIdentity() {
		return this.draft;
	}

	/**
	 * Provider options for the identity form relate-simple field.
	 *
	 * @property providerOptions
	 * @type Array
	 * @for UserProfileIdentitiesComponent
	 * @public
	 */
	get providerOptions() {
		return this.buildIntlOptions(PROVIDER_DEFINITIONS);
	}

	/**
	 * Provider labels keyed by value for the list.
	 *
	 * @property providerLabels
	 * @type Object
	 * @for UserProfileIdentitiesComponent
	 * @public
	 */
	get providerLabels() {
		return this.buildLabelMap(this.providerOptions);
	}

	/**
	 * Selected provider option for the draft form.
	 *
	 * @property selectedProvider
	 * @type {Object|null}
	 * @for UserProfileIdentitiesComponent
	 * @public
	 */
	get selectedProvider() {
		return this.findSelectedOption(
			this.providerOptions,
			this.newIdentity?.provider
		);
	}
}
