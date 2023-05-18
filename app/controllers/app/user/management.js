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
     * This function is used to delete a user.
     *
     * @method deleteUser
     * @public
     */
    @action deleteUser(user) {
        Logger.debug('+App.User.Management.Controller>::deleteUser()');
        let _self = this;
        Logger.debug(self);

        let messenger = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.user.management.list.deleteUser", { name: user.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.user.management.list.confirmDeleteUser")).string,
                    action: function () {
                        user.destroyRecord().then(function (e) {
                            return messenger.update({
                                message: _self.intl.t("views.app.user.management.list.userDeleted"),
                                type: 'success',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: htmlSafe(_self.intl.t("views.app.user.management.list.onsecondthought")).string,
                    action: function () {
                        return messenger.update({
                            message: _self.intl.t("views.app.user.management.list.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                },

            }
        });

        Logger.debug('-App.User.Management.Controller>::deleteUser()');
    }

    /**
     * This function is used to update the account status of a user.
     *
     * @method changeUserStatus
     * @param {Event} evt
     * @param {Prometheus.Models.User} user
     * @public
     */
    @action changeUserStatus(user, evt) {
        let accountStatus = (evt.target.checked) ? 'active' : 'inactive';
        user.set('accountStatus', accountStatus);
        user.save();
    }

    /**
     * This function is used to update the account status of multiple users.
     *
     * @method changeMultipleUserStatus
     * @param {Event} evt
     * @public
     */
    @action changeMultipleUserStatus(evt) {
        let accountStatus = (evt.target.checked) ? 'active' : 'inactive';

        this.getSelectedUsers().forEach(user => {
            if (user.accountStatus !== accountStatus) {
                user.set('accountStatus', accountStatus)
                user.save();
            }
        });
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
        let allUsersActive = users.every((user) => {
            return user.accountStatus === 'active';
        });

        if (allUsersActive && evt.target.checked) {
            $('.user-mass-actions [data-input-type=switch]').prop('checked', true);
        } else {
            $('.user-mass-actions [data-input-type=switch]').prop('checked', false);
        }
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
}
