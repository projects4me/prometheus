/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { ref } from 'yup';
import ENV from 'prometheus/config/environment';
import { action } from '@ember/object';

/**
 * The Reset password controller.
 *
 * @class ResetPasswordController
 * @namespace Prometheus.Controller
 * @extends PrometheusCreateController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ResetPasswordController extends PrometheusCreateController {
	/**
	 * This property is used to bind with password field.
	 *
	 * @property password
	 * @type String
	 * @for ResetPasswordController
	 * @public
	 */
	@tracked password = '';

	/**
     This property is used to bind with confirm password field.
     * 
     * @property passwordConfirmation
     * @type String
     * @for ResetPasswordController
     * @public
     */
	@tracked passwordConfirmation = '';

	/**
	 * Template's metadata for signin controller.
	 *
	 * This object holds all of the information that we need to create our schema and also need to
	 * render the template (in future).
	 * @property metadata
	 * @type Object
	 * @for ResetPasswordController
	 * @protected
	 */
	metadata = {
		sections: [
			{
				name: 'resetPassword',
				fields: [
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
	 * This function is used to update the user password. User will be routed to the
	 * signin page after successful password update.
	 *
	 * @method updateUserPassword
	 */
	@action
	async updateUserPassword() {
		let token = this.router.resetToken;
		let url = `${ENV.api.host}/api/v${ENV.api.version}/resetpassword/${token}`;
		let requestBody = {
			password: this.password,
			resetToken: token
		};
		let _self = this;

		await fetch(url, {
			method: 'PATCH',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			if (response.ok) {
				new Messenger().post({
					message: _self.intl.t(`views.signin.resetPassword.success`),
					type: 'success',
					showCloseButton: true
				});
				this.router.transitionTo('signin');
			} else {
				new Messenger().post({
					message: _self.intl.t(`views.signin.resetPassword.error`),
					type: 'error',
					showCloseButton: true
				});
			}
		});
	}
}
