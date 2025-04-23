/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import { service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import ENV from "prometheus/config/environment";

/**
 * This the signin controller.
 *
 * @class SigninController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default class SignInController extends PrometheusCreateController {
    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for SigninController
     * @public
     */
    @service("intl") intl;

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verfy whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for SigninController
     * @public
     */
    @service("session") session;

    /**
     * This property is used to toggle the forget password form.
     *
     * @property forgetPassword
     * @type Boolean
     * @for SigninController
     * @public
     */
    @tracked forgetPassword = false;

    /**
     * This property is used to store user's email.
     *
     * @property email
     * @type String
     * @for SigninController
     * @public
     */
    @tracked email = "";

    /**
     * This property is used to store user's name.
     *
     * @property username
     * @type String
     * @for SigninController
     * @public
     */
    @tracked username = "";

    /**
     * The property is used to store user's password.
     *
     * @property password
     * @type String
     * @for SigninController
     * @public
     */
    @tracked password = "";

    /**
     * This property is used to store error message generated while user is signing in
     * to the application, if something went wrong.
     *
     * @property errorMessage
     * @type String
     * @for SigninController
     * @public
     */
    @tracked errorMessage = "";

    /**
     * This property is used to store user's preferred language.
     *
     * @property preferredLanguage
     * @type String
     * @for SigninController
     * @public
     */
    @tracked preferredLanguage = "en";

    /**
     * Template's metadata for signin controller.
     *
     * This object holds all of the information that we need to create our schema and also need to
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for SigninController
     * @protected
     */
    metadata = {
        sections: [
            {
                name: "forgetPasswordSection",
                fields: [
                    {
                        name: "email",
                        component: "FormFields::FieldText",
                        placeholder: "views.app.user.create.emailplaceholder",
                        label: "views.app.user.create.email",
                        type: "text",
                        value: "value",
                        lengthRequired: true,
                        modifiers: [],
                        dataAttributes: [],
                        actions: [],
                        events: [],
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required",
                                    },
                                    {
                                        name: "email",
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        ],
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
     * This function invalidates the session which effectively logs the user out
     * of the application and if user is authenticated then we'll route user to
     * "app" route
     *
     * @method authenticate
     * @public
     */
    @action async authenticate() {
        let _self = this;
        let username = _self.username;
        let password = _self.password;

        await _self.session
            .authenticate("authenticator:oauth2", username, password)
            .then(
                () => {
                    if (_self.session.isAuthenticated) {
                        localStorage.removeItem("projectId");
                        //getting requested url when user was unauthenticated
                        let oldRequestedUrl = _self.session.oldRequestedUrl;
                        //if requested url is present then route to that url otherwise route user to /app
                        let urlToRoute =
                            oldRequestedUrl && oldRequestedUrl != "/"
                                ? oldRequestedUrl
                                : "app";

                        _self.session.handleAuthentication(urlToRoute);
                    }
                },
                (response) => {
                    new Messenger().post({
                        message: _self.intl.t(`views.signin.${response.error}`),
                        type: "error",
                        showCloseButton: true,
                    });
                }
            );
    }

    /**
     * This property returns the boolean value to set the "Remember me" checkbox.
     *
     * @property rememberMe
     * @type Boolean
     * @for SigninController
     */
    get rememberMe() {
        let rememberMe = localStorage.getItem("remember_me");

        // If rememberMe is null, set remember_me property into localstorage
        if (rememberMe === null) {
            localStorage.setItem("remember_me", false);
        }

        return localStorage.getItem("remember_me") === "true" ? true : false;
    }

    /**
     * This function is used to set remember me property in local storage.
     *
     * @method setRememberMe
     * @param {String} value
     */
    @action setRememberMe(value) {
        localStorage.setItem("remember_me", value.target.checked);
    }

    /**
     * Update the language of the application according to user's preference.
     *
     * @method updateLanguage
     * @param {Object} language
     */
    @action updateLanguage(language) {
        this.preferredLanguage = language.value;
    }

    /**
     * This function toggles the forget password form.
     *
     * @method toggleForgetPassword
     */
    @action toggleForgetPassword() {
        this.forgetPassword = !this.forgetPassword;
    }

    /**
     * This function sends the password reset link to user's email.
     *
     * @method sendPasswordResetLink
     */
    @action sendPasswordResetLink() {
        const email = this.email;
        let _self = this;
        let emailModel = {
            email: email,
        };

        return new Promise((resolve, reject) => {
            this.validate(emailModel, "forgetPasswordSection").then(
                (validation) => {
                    if (validation.isValid) {
                        fetch(
                            `${ENV.api.host}/api/v${ENV.api.version}/forgetpassword`,
                            {
                                method: "POST",
                                body: JSON.stringify({ email }),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }
                        )
                            .then((response) => {
                                if (response.ok) {
                                    new Messenger().post({
                                        message: _self.intl.t(
                                            `views.signin.forgetPassword.success`
                                        ),
                                        type: "success",
                                        showCloseButton: true,
                                    });
                                    this.toggleForgetPassword();
                                    resolve();
                                } else {
                                    new Messenger().post({
                                        message: _self.intl.t(
                                            `views.signin.forgetPassword.error`
                                        ),
                                        type: "error",
                                        showCloseButton: true,
                                    });
                                    console.error(
                                        "Failed to send password reset link"
                                    );
                                }
                            })
                            .catch((error) => {
                                new Messenger().post({
                                    message: _self.intl.t(
                                        `views.signin.forgetPassword.error`
                                    ),
                                    type: "error",
                                    showCloseButton: true,
                                });
                                console.error(
                                    "An error occurred while sending the password reset link:",
                                    error
                                );
                                reject();
                            });
                    } else {
                        this._showError(validation.errors, "user");
                        reject();
                    }
                }
            );
        });
    }
}
