/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import format from "../utils/data/format";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class App
 * @namespace Prometheus.Controllers
 * @extends Prometheus
 * @author Hammad Hassan <gollmer@gmail.com>
 */
export default class AppController extends PrometheusController {

    /**
     * These are the roles in the system
     *
     * @property roles
     * @type Prometheus.Model.Role
     * @for App
     * @public
     */
    @tracked roles = {};

    /**
     * These are the users in the system
     *
     * @property users
     * @type Prometheus.Model.User
     * @for App
     * @public
     */
    @tracked users = {};

    /**
     * These are the chatrooms of users in the system
     *
     * @property chatrooms
     * @type Prometheus.Model.User
     * @for App
     * @public
     */
    @tracked chatrooms = [];

    /**
     * This service holds current authenticated user permissions on different resources of
     * the application.
     *
     * @property acl
     * @type Ember.Service
     * @for AppController
     */
    @service acl;


    /**
     * This is the list of roles that has been extracted
     *
     * @property rolesList
     * @type Ember.computed
     * @returns array
     * @public
     */
    get rolesList() {
        return (new format(this)).getSelectList(this.roles);
    }

    /**
     * This is the list of users that has been extracted
     *
     * @property usersList
     * @type Ember.computed
     * @returns array
     * @public
     */
    get usersList() {
        Logger.debug(this.users);
        return (new format(this)).getSelectList(this.users);
    }

    /**
     * This is the list of projects that has been extracted.
     *
     * @property projectsList
     * @type Ember.computed
     * @returns array
     * @public
     */
    get projectsList() {
        Logger.debug(this.projects);
        return (new format(this)).getSelectList(this.projects);
    }

    /**
     * This function invalidates the session which effectively logs the user out
     * of the application
     *
     * @method invalidateSession
     * @public
     */
    @action invalidateSession() {
        this.session.invalidate();
    }

    /**
     * This function navigates a user to the current user's profile page
     *
     * @method userProfile
     * @public
     */
    @action userProfile() {
        Logger.debug('+Prometheus.Controllers.App::userProfile');
        let self = this;
        let user_id = self.get('currentUser').user.id;

        self.transitionToRoute('app.user.page', user_id);
        Logger.debug('-Prometheus.Controllers.App::userProfile');
    }

    /**
     * This function is used to take a user to a searched item
     *
     * @method itemSearched
     * @public
     */
    @action itemSearched(selected) {
        Logger.debug('+Prometheus.Controllers.App::itemSearched');
        let _self = this;

        _self.transitionToRoute('app.project', selected.project.get('shortCode'));
        _self.transitionToRoute('app.project.issue.page', selected.number);
        Logger.debug('-Prometheus.Controllers.App::itemSearched');
    }

    /**
     * This function is used to start a private chat with another user
     *
     * @method startChat
     * @param Prometheus.Models.User user
     */
    @action startChat(user) {
        Logger.debug('Prometheus.Controllers.App::startChat');
        let _self = this;
        Logger.debug(user);
        Logger.debug(_self);

        let options = {
            query: '((Chatroom.type : private) AND (((ownedby.id : ' + _self.get('currentUser.user.id') + ') AND (conversers.id : ' + user.id + ')) OR ((ownedby.id : ' + user.id + ') AND (conversers.id : ' + _self.get('currentUser.user.id') + '))))'
        };

        _self.get('store').query('chatroom', options).then(function (data) {
            Logger.debug(data);
            let chatrooms = _self.get('chatrooms');
            Logger.debug(chatrooms);
            if (chatrooms === undefined) {
                Logger.debug('Initing chatrooms');
                _self.set('chatrooms', data);
            } else {
                Logger.debug('Adding room');
                chatrooms.pushObject(data.get('firstObject'));
                _self.set('chatrooms', chatrooms);
            }
        });
        // If no chatroom was found then create one

        Logger.debug(options);
        Logger.debug('-Prometheus.Controllers.App::startChat');
    }

    /**
     * This function is called when a new message arrives for a user
     *
     * @method newMessage
     * @param message
     */
    @action newMessage(message) {
        Logger.debug('Prometheus.Controllers.App::newMessage');
        Logger.debug(message);
        Logger.debug('-Prometheus.Controllers.App::newMessage');
    }

    /**
     * This function detects if the user's timezone has changed from their stored timezone.
     * If a change is detected, it prompts the user to update their timezone through a modal.
     *
     * @method detectTimezoneChange
     * @protected
     */
    detectTimezoneChange() {
        Logger.debug('Prometheus.Controllers.AppLoadingAssets::detectTimezoneChange');
        let userTimezone = this.currentUser.user.timezone;
        let currentTimezone = moment.tz.guess(true);
        if (userTimezone !== currentTimezone) {
            this.showTimezoneChangeNotification(currentTimezone);
        }
        Logger.debug('-Prometheus.Controllers.AppLoadingAssets::detectTimezoneChange');
    }

    /**
     * This function displays a modal asking the user if they want to update their timezone.
     * If confirmed, updates the user's timezone and saves it to the backend.
     * Shows appropriate success/error messages to the user.
     *
     * @method showTimezoneChangeNotification
     * @param {String} currentTimezone The detected timezone to update to
     * @protected
     */
    showTimezoneChangeNotification(currentTimezone) {
        Logger.debug('Prometheus.Controllers.AppLoadingAssets::showTimezoneChangeNotification');
        let _self = this;
        new Messenger().post({
            message: _self.intl.t('views.app.timezone.change.prompt'),
            type: "info",
            showCloseButton: true,
            hideAfter: false,
            actions: {
                confirm: {
                    label: _self.intl.t('global.form.yes'),
                    action: async function() {
                        let user = _self.currentUser.user;
                        user.timezone = currentTimezone;
                        try {
                            this.update({
                                message: _self.intl.t('views.app.timezone.change.updating'),
                                actions: null
                            });
                            await user.save();
                            this.update({
                                message: _self.intl.t('views.app.timezone.change.success'),
                                hideAfter: 5
                            });
                        } catch (error) {
                            Logger.error('Error updating user timezone:', error);
                            this.update({
                                message: _self.intl.t('views.app.timezone.change.error'),
                                type: "error",
                                hideAfter: 5
                            });
                        }
                    }
                },
                cancel: {
                    label: _self.intl.t('global.form.no'),
                    action: function() {
                        this.hide();
                    }
                }
            }
        });
        Logger.debug('-Prometheus.Controllers.AppLoadingAssets::showTimezoneChangeNotification');
    }
}