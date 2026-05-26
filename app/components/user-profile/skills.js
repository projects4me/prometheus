/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import UserProfileBaseInlineSectionComponent from 'prometheus/components/user-profile/base-inline-section';

const PROFICIENCY_DEFINITIONS = [
	{
		value: 'beginner',
		labelKey: 'views.app.user.page.skill.proficiencyBeginner',
		shortLabelKey: 'views.app.user.page.skill.proficiencyBeginnerShort',
	},
	{
		value: 'intermediate',
		labelKey: 'views.app.user.page.skill.proficiencyIntermediate',
		shortLabelKey: 'views.app.user.page.skill.proficiencyIntermediateShort',
	},
	{
		value: 'advanced',
		labelKey: 'views.app.user.page.skill.proficiencyAdvanced',
		shortLabelKey: 'views.app.user.page.skill.proficiencyAdvancedShort',
	},
	{
		value: 'expert',
		labelKey: 'views.app.user.page.skill.proficiencyExpert',
		shortLabelKey: 'views.app.user.page.skill.proficiencyExpertShort',
	},
];

/**
 * Renders the Skills box on the user profile: saved skills as compact chips with
 * proficiency badges, and an inline form to add a skill name and proficiency level.
 *
 * Validation uses the `userSkill` schema on `AppUserPageController`, including
 * a metadata test that rejects duplicate skill names. The draft is held on `draft`
 * (exposed as `newSkill` in the template) until save succeeds.
 *
 * @class UserProfileSkillsComponent
 * @namespace Prometheus.Components.UserProfile
 * @extends UserProfileBaseInlineSectionComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfileSkillsComponent extends UserProfileBaseInlineSectionComponent {
	/**
	 * Yup schema section name for skill fields.
	 *
	 * @property schemaName
	 * @type String
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get schemaName() {
		return 'userSkill';
	}

	/**
	 * Fields validated and cleared for the skill form.
	 *
	 * @property fieldNames
	 * @type Array
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get fieldNames() {
		return ['name', 'proficiencyLevel'];
	}

	/**
	 * Ember Data model name for a skill record.
	 *
	 * @property recordType
	 * @type String
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get recordType() {
		return 'userskill';
	}

	/**
	 * Has-many key on the profile user model.
	 *
	 * @property relationshipKey
	 * @type String
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get relationshipKey() {
		return 'skills';
	}

	/**
	 * i18n key for save and remove success toasts.
	 *
	 * @property toastSavedKey
	 * @type String
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get toastSavedKey() {
		return 'views.app.user.page.skill.saved';
	}

	/**
	 * i18n key for remove failure toasts.
	 *
	 * @property toastSaveFailedKey
	 * @type String
	 * @for UserProfileSkillsComponent
	 * @protected
	 */
	get toastSaveFailedKey() {
		return 'views.app.user.page.skill.saveFailed';
	}

	/**
	 * Alias of `draft` for the skill form template.
	 *
	 * @property newSkill
	 * @type {Prometheus.Models.Userskill|null}
	 * @for UserProfileSkillsComponent
	 * @public
	 */
	get newSkill() {
		return this.draft;
	}

	/**
	 * Proficiency options for the skill form relate-simple field.
	 *
	 * @property proficiencyOptions
	 * @type Array
	 * @for UserProfileSkillsComponent
	 * @public
	 */
	get proficiencyOptions() {
		return this.buildIntlOptions(PROFICIENCY_DEFINITIONS);
	}

	/**
	 * Full proficiency labels keyed by value for chip tooltips.
	 *
	 * @property proficiencyLabels
	 * @type Object
	 * @for UserProfileSkillsComponent
	 * @public
	 */
	get proficiencyLabels() {
		return this.buildLabelMap(this.proficiencyOptions);
	}

	/**
	 * Short proficiency labels keyed by value for chip badges.
	 *
	 * @property proficiencyShortLabels
	 * @type Object
	 * @for UserProfileSkillsComponent
	 * @public
	 */
	get proficiencyShortLabels() {
		return Object.fromEntries(
			PROFICIENCY_DEFINITIONS.map(({ value, shortLabelKey }) => [
				value,
				this.intl.t(shortLabelKey),
			])
		);
	}

	/**
	 * Selected proficiency option for the draft skill form.
	 *
	 * @property selectedProficiency
	 * @type {Object|null}
	 * @for UserProfileSkillsComponent
	 * @public
	 */
	get selectedProficiency() {
		return this.findSelectedOption(
			this.proficiencyOptions,
			this.newSkill?.proficiencyLevel
		);
	}
}
