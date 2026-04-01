/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { fileToBase64 } from 'prometheus/utils/image-to-base64';
import ENV from 'prometheus/config/environment';

/**
 * The controller for user create page.
 *
 * @class AppUserCreateController
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends PrometheusCreateController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserCreateController extends PrometheusCreateController {
	/**
	 * This object holds all of the information that we need to create our schema and also need to
	 * render the template (in future).
	 * @property metadata
	 * @type Object
	 * @for AppUserCreateController
	 * @private
	 */
	metadata = {
		sections: [
			{
				name: 'userCreate',
				fields: [
					{
						name: 'name',
						component: 'FormFields::FieldText',
						placeholder: 'views.app.user.create.nameplaceholder',
						label: 'views.app.user.create.name',
						type: 'text',
						value: 'value',
						lengthRequired: true,
						modifiers: [],
						dataAttributes: [],
						actions: [],
						events: [],
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
				{
					name: 'email',
					component: 'FormFields::FieldText',
					placeholder: 'views.app.user.create.emailplaceholder',
					label: 'views.app.user.create.email',
					type: 'text',
					value: 'value',
					lengthRequired: true,
					modifiers: [],
					dataAttributes: [],
					actions: [],
					events: [],
					validations: {
						default: {
							type: 'string',
							rules: [
								{
									name: 'required'
								},
								{
									name: 'email'
								}
							]
						},
						tests: {
							name: "email-exists",
							action: this.checkUserEmailAvailability,
							message: this.intl.t('views.app.user.create.validation.emailTaken')
						},
						tests: {
							name: "email-validated",
							action: this.validateEmail,
							message: this.intl.t('views.app.user.create.validation.invalidEmailFormat')
						}
					}
				},
					{
						name: 'dateOfBirth',
						component: 'FormFields::FieldDate',
						placeholder: 'views.app.user.create.dobplaceholder',
						label: 'views.app.user.create.dateofbirth',
						value: 'value',
						mask: 'alphanumeric',
						format: 'DD-MM',
						lengthRequired: true,
						modifiers: [],
						dataAttributes: [],
						actions: [],
						events: [],
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'language',
						component: 'AppUi::Language',
						placeholder:
							'views.app.user.create.languageplaceholder',
						label: 'views.app.user.create.language',
						type: 'text',
						value: 'value',
						lengthRequired: true,
						modifiers: [],
						dataAttributes: [],
						actions: [],
						events: [],
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					},
					{
						name: 'timezone',
						component: 'User::Create::Timezones',
						placeholder:
							'views.app.user.create.timezoneplaceholder',
						label: 'views.app.user.create.timezone',
						type: 'text',
						value: 'value',
						lengthRequired: true,
						modifiers: [],
						dataAttributes: [],
						actions: [],
						events: [],
						validations: {
							default: {
								type: 'string',
								rules: [
									{
										name: 'required'
									}
								]
							}
						}
					}
				]
			}
		]
	};

	/**
	 * This function is called on the initialization of the controller. In this function
	 * we're calling setupSchema method in order to generate schema, by analyzing metadata
	 * defined in the controller, that will be used to validate the form of the template.
	 *
	 * @method constructor
	 * @public
	 */
	constructor() {
		super(...arguments);
		this.setupSchema();
	}

	/**
	 * This is the module for which we are trying to create.
	 *
	 * @property module
	 * @type String
	 * @for AppUserCreateController
	 * @protected
	 */
	module = 'user';

	/**
	 * Holds the project option `{label, value}` selected in the Membership
	 * section. Null until the user picks a project.
	 *
	 * @property selectedProject
	 * @type {Object|null}
	 * @for AppUserCreateController
	 * @public
	 */
	@tracked selectedProject = null;

	/**
	 * Holds the role option `{label, value}` selected in the Membership
	 * section. Null until the user picks a role.
	 *
	 * @property selectedRole
	 * @type {Object|null}
	 * @for AppUserCreateController
	 * @public
	 */
	@tracked selectedRole = null;

	/**
	 * Returns the formatted project select list sourced from the app
	 * controller so the Membership project dropdown is always in sync with
	 * the globally loaded project list.
	 *
	 * @property projectsList
	 * @type {Array}
	 * @for AppUserCreateController
	 * @public
	 */
	get projectsList() {
		return this.appController.projectsList;
	}

	/**
	 * Returns the formatted role select list sourced from the app controller
	 * so the Membership role dropdown is always in sync with the globally
	 * loaded roles.
	 *
	 * @property rolesList
	 * @type {Array}
	 * @for AppUserCreateController
	 * @public
	 */
	get rolesList() {
		return this.appController.rolesList;
	}

	/**
	 * Holds the temporary data URL of the image selected by the user before
	 * cropping. When non-null, the cropper modal is shown. Cleared after the
	 * user confirms or cancels the crop.
	 *
	 * @property cropImageSrc
	 * @type {String|null}
	 * @for AppUserCreateController
	 * @public
	 */
	@tracked cropImageSrc = null;

	/**
	 * This function returns the success message
	 *
	 * @method getSuccessMessage
	 * @param model
	 */
	getSuccessMessage(model) {
		return htmlSafe(
			this.intl.t('views.app.user.created', {
				name: model.get('name')
			})
		);
	}

	/**
	 * Navigation is handled inside afterSave (after the optional membership
	 * record has been persisted), so this hook is intentionally left empty.
	 *
	 * @method navigateToSuccess
	 */
	navigateToSuccess() {}

	/**
	 * Called by the base _save flow after the user record has been persisted.
	 * If both a project and a role were selected in the Membership section a
	 * membership record is created and saved before navigating to the user
	 * profile page. When no membership was chosen the navigation happens
	 * immediately.
	 *
	 * @method afterSave
	 * @param {Prometheus.Models.User} savedUser - The newly saved user record
	 * @for AppUserCreateController
	 * @public
	 */
	async afterSave(savedUser) {
		if (this.selectedProject && this.selectedRole) {
			let membership = this.store.createRecord('membership', {
				relatedId: this.selectedProject.value,
				relatedTo: 'project',
				userId: savedUser.get('id'),
				roleId: this.selectedRole.value
			});

			await membership.save();
			this.router.transitionTo('app.user.page', savedUser.get('id'));
		}

		this.router.transitionTo('app.user.page', savedUser.get('id'));
	}

	/**
	 * Called when the user selects a file from the profile-picture component.
	 * Validates the file type and size, then converts it to a data URL and
	 * stores it in cropImageSrc to trigger the cropper modal. The image is
	 * NOT saved to the model until the user confirms the crop.
	 *
	 * @method uploadImage
	 * @param {String} imageElementClass - CSS class of the preview img element
	 * @param {Object} file - ember-file-upload file object
	 * @for AppUserCreateController
	 * @public
	 */
	@action
	async uploadImage(imageElementClass, file) {
		const { maxFileSize, allowedTypes } = ENV.app.upload.profilePicture;

		if (!allowedTypes.includes(file.file.type)) {
			new Messenger().post({
				message: this.intl.t(
					'views.app.user.profilePicture.imageTypeError',
					{ types: allowedTypes.map((t) => t.split('/')[1]).join(', ') }
				).toString(),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			return;
		}

		if (file.file.size > maxFileSize) {
			new Messenger().post({
				message: this.intl.t(
					'views.app.user.profilePicture.imageSizeError',
					{ limit: `${maxFileSize / (1024 * 1024)}MB` }
				).toString(),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			return;
		}

		this.cropImageSrc = await fileToBase64(file);
	}

	/**
	 * Called by the cropper modal when the user clicks Apply. Stores the
	 * cropped base64 string on the model, updates the preview img, and
	 * closes the cropper overlay.
	 *
	 * @method applyCrop
	 * @param {String} croppedBase64 - JPEG base64 data URI from Cropper.js
	 * @for AppUserCreateController
	 * @public
	 */
	@action
	applyCrop(croppedBase64) {
		this.model.profilePicture = croppedBase64;
		$('.user-profile-img').attr('src', croppedBase64);
		this.cropImageSrc = null;
	}

	/**
	 * Called by the cropper modal when the user clicks Cancel. Discards the
	 * selected image and closes the cropper overlay without changing the model.
	 *
	 * @method cancelCrop
	 * @for AppUserCreateController
	 * @public
	 */
	@action
	cancelCrop() {
		this.cropImageSrc = null;
	}

	/**
	 * This is the task that is used to check whether the provided email address is already
	 * taken. Before querying the store it first validates the email format; if the format is
	 * invalid the task exits early without making a server request.
	 *
	 * @method checkUserEmailAvailability
	 * @param {String} email
	 * @return {Boolean}
	 * @for AppUserCreateController
	 * @public
	 */
	@action async checkUserEmailAvailability(email) {
		let _userOptions = {
			query: `((User.email : ${email} ))`
		};

		let users = await this.store.query('user', _userOptions);
		return users.length === 0;
	}

	/**
	 * This method is used to validate the email format.
	 *
	 * @method validateEmail
	 * @param {String} email
	 * @return {Boolean}
	 * @for AppUserCreateController
	 * @public
	 */
	@action async validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	/**
	 * Validates the cross-field dependency between the Membership project and
	 * role dropdowns. Both fields must be either both filled or both empty —
	 * selecting one without the other is not allowed. Violations are reported
	 * via Messenger so the save button stays enabled for the user to correct.
	 *
	 * @method validateMembership
	 * @return {Boolean} true when the membership section is valid
	 * @for AppUserCreateController
	 * @public
	 */
	validateMembership() {
		const hasProject = Boolean(this.selectedProject);
		const hasRole = Boolean(this.selectedRole);

		if (hasProject && !hasRole) {
			new Messenger().post({
				message: this.intl.t(
					'views.app.user.create.membership.roleRequired'
				).toString(),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			return false;
		}

		if (hasRole && !hasProject) {
			new Messenger().post({
				message: this.intl.t(
					'views.app.user.create.membership.projectRequired'
				).toString(),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			return false;
		}

		return true;
	}
	/**
	 * Overrides the base save action to run the membership cross-field
	 * validation before delegating to the parent save flow. Returns a rejected
	 * Promise on failure so the button's catch path re-enables it for retry.
	 *
	 * @method save
	 * @param {String} schemaName
	 * @for AppUserCreateController
	 * @public
	 */
	@action save(schemaName) {
		if (!this.validateMembership()) {
			return Promise.reject();
		}
		return super.save(schemaName);
	}
}
