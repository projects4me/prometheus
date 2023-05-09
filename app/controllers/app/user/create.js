/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import { htmlSafe } from '@ember/template';
import { task } from 'ember-concurrency';
import { tracked } from "@glimmer/tracking";
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

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
     * This property is used to keep track validation message in order to show the user that whether the 
     * typed username is available or not.
     *
     * @property validationMessage
     * @type String
     * @for AppUserCreateController
     * @protected
     */
     @tracked validationMessage = "";

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
        return htmlSafe(this.intl.t('views.app.user.created', {
            name: model.get('name')
        }));
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
     @(task(function* (username) {
        let _userOptions = {
            query: `((User.username : ${username} ))`
        };

        if (username !== '') {
            let users = yield this.store.query('user', _userOptions);
            let isUsernameAvailable = users.length === 0;

            this.validationMessage =
                (isUsernameAvailable)
                    ? this.intl.t("views.app.user.create.validation.usernameAvailable")
                    : this.intl.t("views.app.user.create.validation.usernameTaken");

            this.isSuccessful = isUsernameAvailable;
        } else {
            this.validationMessage = '';
        }
    })) checkUsernameAvailabilityTask

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
