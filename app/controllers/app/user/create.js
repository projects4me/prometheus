/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { htmlSafe } from '@ember/template';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { ref } from 'yup';

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
							}
						}
					},
					{
						name: 'username',
						component: 'FormFields::FieldText',
						placeholder:
							'views.app.user.create.usernameplaceholder',
						label: 'views.app.user.create.username',
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
							},
							custom: [
								{
									action: 'checkUsernameAvailabilityTask'
								}
							]
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
						name: 'password',
						component: 'FormFields::FieldText',
						placeholder:
							'views.app.user.create.passwordplaceholder',
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
						name: 'passwordConfirmation',
						component: 'FormFields::FieldText',
						placeholder:
							'views.app.user.create.confirmpasswordplaceholder',
						label: 'views.app.user.create.confirmpassword',
						type: 'text',
						value: 'passwordConfirmation',
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
										name: 'oneOf',
										value: [
											[ref('password')],
											() =>
												this.intl.t(
													'views.app.user.create.validation.passwordMatch'
												)
										]
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
	 * This property is used to keep track validation message in order to show the user that whether the
	 * typed username is available or not.
	 *
	 * @property validationMessage
	 * @type String
	 * @for AppUserCreateController
	 * @protected
	 */
	@tracked validationMessage = '';

	/**
	 * This property is used to keep track that whether validation is successful or not.
	 *
	 * @property isSuccessful
	 * @type boolean
	 * @for AppUserCreateController
	 * @protected
	 */
	@tracked isSuccessful;

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
	 * This function navigate to user's profile page.
	 *
	 * @method navigateToSuccess
	 * @param model
	 */
	navigateToSuccess(model) {
		this.router.transitionTo('app.user.page', model.get('id'));
	}

	/**
	 * This is the task that is used to perform the a username search. It also sets proper validation message
	 * based on username availability.
	 *
	 * @property checkUsernameAvailabilityTask
	 * @type task
	 * @for AppUserCreateController
	 * @public
	 */
	@task(function* (username) {
		let _userOptions = {
			query: `((User.username : ${username} ))`
		};

		if (username !== '') {
			let users = yield this.store.query('user', _userOptions);
			let isUsernameAvailable = users.length === 0;

			this.validationMessage = isUsernameAvailable
				? this.intl.t(
						'views.app.user.create.validation.usernameAvailable'
				  )
				: this.intl.t('views.app.user.create.validation.usernameTaken');

			this.isSuccessful = isUsernameAvailable;
		} else {
			this.validationMessage = '';
		}
	})
	checkUsernameAvailabilityTask;

	/**
	 * This function is called when user input in text field.
	 *
	 * @method onInput
	 * @for AppUserCreateController
	 * @public
	 */
	@action
	async onInput(event) {
		let query = event.target.value;
		debounce(this, this.checkUsernameAvailabilityTask.perform, query, 200);
	}
}
