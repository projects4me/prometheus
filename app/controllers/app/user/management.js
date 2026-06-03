/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from "prometheus/controllers/prometheus/list";
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

/**
 * The controller for user management page.
 *
 * @class AppUserManagementController
 * @namespace Prometheus.Controllers
 * @module App.Users
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserManagementController extends PrometheusListController {

    /**
     * This function is used to search the user by its name.
     *
     * @method searchUserByName
     * @public
     */
    @action searchUserByName(query) {
        let updatedQuery = `((User.name CONTAINS ${query}))`;

        //this.query is present inside PrometheusList controller
        this.set('query', updatedQuery);
    }

    /**
     * This function is used to update the account status of a user.
     *
     * @method changeUserStatus
     * @param {Event} evt
     * @param {Prometheus.Models.User} user
     * @public
     */
    @action
    async changeUserStatus(user, evt) {
        let accountStatus = (evt.target.checked) ? 'active' : 'inactive';

        //disable switch element until the model is updated
        evt.target.disabled = true;
        this.toggleCursorStyle(evt.target.nextElementSibling, 'wait', 'wait');

        user.set('accountStatus', accountStatus);
        await user.save();

        evt.target.disabled = false;
        this.toggleCursorStyle(evt.target.nextElementSibling, 'pointer', 'auto');
    }

    /**
     * This function is used to update the account status of multiple users.
     *
     * @method changeMultipleUserStatus
     * @param {Event} evt
     * @public
     */
    @action
    async changeMultipleUserStatus(evt) {
        let accountStatus = evt.target.checked ? 'active' : 'inactive';
        let selectedUsers = this.getSelectedUsers();
        let usersToUpdate = selectedUsers.filter((user) => user.accountStatus !== accountStatus);

        if (!usersToUpdate.length) {
            return;
        }

        this.setMassSwitchesLoading(true);

        try {
            await Promise.all(
                usersToUpdate.map(async (user) => {
                    user.set('accountStatus', accountStatus);
                    await user.save();
                })
            );
        } finally {
            this.setMassSwitchesLoading(false);
            this.syncMassSwitchState();
        }
    }

    /**
     * This function is overridden and is used to call toggleMassSwitch() function which is used 
     * to toggle the mass switch control button on selection of single user.
     * @param {Event} evt 
     */
    @action select(evt) {
        super.select(evt);
        this.toggleMassSwitch(evt);
    }

    /**
     * This function is overridden and is used to call toggleMassSwitch() function which is used
     * to toggle the mass switch control button on selection of multiple users.
     * @param {Event} evt 
     */
    @action selectAll(evt) {
        super.selectAll(evt);
        this.toggleMassSwitch(evt);
    }

    /**
     * This function is used to toggle mass switch control button. It only make that switch to checked when
     * all of the users are active and switch is checked. Otherwise it will make the switch to unchecked.
     * @param {Event} evt 
     */
    toggleMassSwitch(evt) {
        let users = this.getSelectedUsers();
        let allUsersActive = users.every((user) => user.accountStatus === 'active');
        let checked = allUsersActive && evt.target.checked;

        this.syncMassSwitches(checked);
    }

    /**
     * Returns all mass status switch inputs (header and footer).
     *
     * @returns {NodeListOf<HTMLInputElement>}
     */
    getMassSwitchElements() {
        return document.querySelectorAll('.user-mass-actions [data-input-type=switch]');
    }

    /**
     * Keeps header and footer mass switches in the same checked state.
     *
     * @param {Boolean} checked
     */
    syncMassSwitches(checked) {
        this.getMassSwitchElements().forEach((switchEl) => {
            switchEl.checked = checked;
        });
    }

    /**
     * Updates both mass switches to reflect the current status of selected users.
     */
    syncMassSwitchState() {
        let selectedUsers = this.getSelectedUsers();
        let allUsersActive = selectedUsers.length > 0
            && selectedUsers.every((user) => user.accountStatus === 'active');

        this.syncMassSwitches(allUsersActive);
    }

    /**
     * Applies loading state to all mass switches (header and footer).
     *
     * @param {Boolean} loading
     */
    setMassSwitchesLoading(loading) {
        this.getMassSwitchElements().forEach((switchEl) => {
            switchEl.disabled = loading;
            this.toggleCursorStyle(
                switchEl.nextElementSibling,
                loading ? 'wait' : 'pointer',
                loading ? 'wait' : 'auto'
            );
        });
    }

    /**
     * This function returns list of users that are selected.
     * @returns Array
     */
    getSelectedUsers() {
        let _self = this;

        let users = $.makeArray(($('.list-view input[type=checkbox]:checked').not('[data-select=all], [data-input-type=switch]')))
            .reduce((users, userEl) => {
                let userId = $(userEl).data('select');
                users.push(_self.store.peekRecord('user', userId));
                return users;
            }, []);

        return users;
    }

    /**
     * This function is used to change style of the cursor of input element and document body 
     * depending upon the state of the model.
     * 
     * @param {Element} el
     * @param {String} elCursorStyle
     * @param {String} bodyCursorStyle
     */
    toggleCursorStyle(el, elCursorStyle, bodyCursorStyle) {
        el.style.cursor = elCursorStyle;
        document.body.style.cursor = bodyCursorStyle;
    }
}
