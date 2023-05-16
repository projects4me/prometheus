/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import AppUserCreateController from "prometheus/controllers/app/user/create";
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * The controller for user edit page.
 *
 * @class AppUserCreateController
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends PrometheusCreateController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserEditController extends AppUserCreateController {

    /**
     * This function is used to upload the user's profile image.
     * 
     * @param {String} imageElementClass 
     * @param {Object} file 
     */
    @action
    async uploadImage(imageElementClass, file) {

        let options = {
            url: this.store.adapterFor('user').buildURL('userimage'),
            headers: this.store.adapterFor('user').headers,
            data: {
                id: this.model.id
            }
        }

        await file.upload(options);

        //Create a static src object for image
        $(`.${imageElementClass}`).attr('src', URL.createObjectURL(file.file));
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
            field: 'username',
            query: `((User.username : ${username} ))`
        };

        if (username !== '') {
            let users = yield this.store.query('user', _userOptions);
            let isUsernameAvailable = (users.length === 0);

            this.validationMessage =
                (isUsernameAvailable)
                    ? this.intl.t("views.app.user.create.validation.usernameAvailable")
                    : ((users.objectAt(0).username === this.username) ? this.intl.t("views.app.user.create.validation.usernameTakenByYou") : this.intl.t("views.app.user.create.validation.usernameTaken"));

            this.isSuccessful = isUsernameAvailable;
        } else {
            this.validationMessage = '';
        }
    })) checkUsernameAvailabilityTask

    /**
     * This is a placeholder function that is called after the cancel
     * confirm box has been dismissed in confirmation
     *
     * @method afterCancel
     * @protected
     */
    afterCancel() {
        let userId = this.currentUser.user.id;
        this.router.transitionTo('app.user.page', userId);
    }
}