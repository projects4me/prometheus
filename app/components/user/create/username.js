import AppComponent from '../../app';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render username text field.
 *
 * @class UserCreateUsernameComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserCreateUsernameComponent extends AppComponent {

    /**
     * This property is used to keep track validation message in order to show the user that whether the 
     * typed username is available or not.
     *
     * @property validationMessage
     * @type String
     * @for UserCreateUsernameComponent
     * @protected
     */
    @tracked validationMessage = "";

    /**
     * This property is used to keep track that whether validation is successful or not.
     *
     * @property isSuccessful
     * @type boolean
     * @for UserCreateUsernameComponent
     * @protected
     */
    @tracked isSuccessful;

    /**
     * This function is called when user input in text field.
     *
     * @method onInput
     * @for UserCreateUsernameComponent
     * @public
     */
    @action
    async onInput(event) {
        let query = event.target.value;
        debounce(this, this.checkUsernameAvailabilityTask.perform, query, 200);
    }

    /**
     * This is the task that is used to perform the a username search. It also sets proper validation message
     * based on username availability.
     *
     * @property checkUsernameAvailabilityTask
     * @type task
     * @for UserCreateUsernameComponent
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
}