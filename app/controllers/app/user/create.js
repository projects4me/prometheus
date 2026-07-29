/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { fileToBase64 } from 'prometheus/utils/image-to-base64';
import ENV from 'prometheus/config/environment';
import { parse as parseTld } from 'tldts';

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
						tests: [{
							name: "email-exists",
							action: this.checkUserEmailAvailability,
							message: this.intl.t('views.app.user.create.validation.emailTaken')
						},
						{	
							name: "email-validated",
							action: this.validateEmail,
							message: this.intl.t('views.app.user.create.validation.invalidEmailFormat')
						}]
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
	 * Holds the project option `{label, value}` selected for optional
	 * project membership. Null until the user picks a project.
	 *
	 * @property selectedProject
	 * @type {Object|null}
	 * @for AppUserCreateController
	 * @public
	 */
	@tracked selectedProject = null;

	/**
	 * Holds the global application-role option `{label, value}` selected for
	 * optional userrole assignment. Not project-scoped.
	 *
	 * @property selectedRole
	 * @type {Object|null}
	 * @for AppUserCreateController
	 * @public
	 */
	@tracked selectedRole = null;

	/**
	 * Returns the formatted project select list sourced from the app
	 * controller so the project-membership dropdown stays in sync with the
	 * globally loaded project list.
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
	 * Returns the formatted global roles select list sourced from the app
	 * controller (system-wide roles, not project roles).
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
	 * Navigation is handled inside afterSave (after optional membership /
	 * userrole records have been persisted), so this hook is intentionally left empty.
	 *
	 * @method navigateToSuccess
	 */
	navigateToSuccess() {}

	/**
	 * Called by the base _save flow after the user record has been persisted.
	 * Optionally creates a project membership and/or a global application
	 * role assignment (userrole) before navigating to the user profile page.
	 *
	 * @method afterSave
	 * @param {Prometheus.Models.User} savedUser - The newly saved user record
	 * @for AppUserCreateController
	 * @public
	 */
	async afterSave(savedUser) {
		const userId = savedUser.get('id');

		if (this.selectedProject) {
			let membership = this.store.createRecord('membership', {
				projectId: this.selectedProject.value,
				userId: userId
			});
			await membership.save();
		}

		if (this.selectedRole) {
			let userrole = this.store.createRecord('userrole', {
				userId: userId,
				roleId: this.selectedRole.value
			});
			await userrole.save();
		}

		this.router.transitionTo('app.user.page', userId);
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
	 * Validates the TLD of the given email address using the tldts library.
	 * The domain portion (after @) is parsed and checked against the ICANN
	 * public suffix list. Any unrecognised or private TLD returns false.
	 *
	 * @method validateEmail
	 * @param {String} email
	 * @return {Boolean}
	 * @for AppUserCreateController
	 * @public
	 */
	@action async validateEmail(email) {
		const atIndex = email.lastIndexOf('@');
		if (atIndex === -1) {
			return false;
		}

		const domain = email.slice(atIndex + 1);
		const { isIcann, publicSuffix } = parseTld(domain);

		return isIcann === true && publicSuffix !== null;
	}

	/**
	 * This function checks if the form has unsaved changes that should block navigation.
	 * After a successful save Ember Data clears dirty attributes, so
	 * post-save navigation is not blocked.
	 *
	 * @method isDirty
	 * @return {boolean}
	 * @public
	 */
	get isDirty() {
		let modelKeys = _.keys(this.model.changedAttributes());
		let dirtyFields = ['name', 'email', 'dateOfBirth'];
		let cantEmptyFields = ['name', 'email'];

		cantEmptyFields.forEach(field => {
			if (modelKeys.includes(field) && this.model[field] === '') {
				modelKeys.splice(modelKeys.indexOf(field), 1);
			}
		});

		// If the user has selected a project or role, we should block navigation
		if(this.selectedProject || this.selectedRole) {
			return true;
		}

		return modelKeys.some(key => dirtyFields.includes(key));
	}
}
