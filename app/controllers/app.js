/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import format from "../utils/data/format";
import { inject } from '@ember/service';
import { computed } from '@ember/object';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class App
 * @namespace Prometheus.Controllers
 * @extends Prometheus
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Prometheus.extend({

    /**
     * These are the roles in the system
     *
     * @property roles
     * @type Prometheus.Model.Role
     * @for App
     * @public
     */
    roles: {},

    /**
     * These are the users in the system
     *
     * @property users
     * @type Prometheus.Model.User
     * @for App
     * @public
     */
    users: {},

    /**
     * This is the list of roles that has been extracted
     *
     * @property rolesList
     * @type Ember.computed
     * @returns array
     * @public
     */
    rolesList: computed('roles', function(){
        return format.getSelectList(this.get('roles'));
    }),

    /**
     * This is the list of users that has been extracted
     *
     * @property usersList
     * @type Ember.computed
     * @returns array
     * @public
     */
    usersList: computed('users', function(){
        Logger.debug(this.get('users'));
        return format.getSelectList(this.get('users'));
    }),

    /**
     * The events that this controller is listing to
     *
     * @property actions
     * @type Object
     * @for App
     * @public
     */
    actions: {

        /**
         * This function invalidates the session which effectively logs the user out
         * of the application
         *
         * @method invalidateSession
         * @public
         */
        invalidateSession() {
            this.get('session').invalidate();
        },

        /**
         * This function navigates a user to the current user's profile page
         *
         * @method userProfile
         * @public
         */
        userProfile() {
            Logger.debug('+Prometheus.Controllers.App::userProfile');
            let self = this;
            let user_id = self.get('currentUser').user.id;

            self.transitionToRoute('app.user.page',{user_id: user_id});
            Logger.debug('-Prometheus.Controllers.App::userProfile');
        },

        /**
         * This function is used to start a private chat with another user
         *
         * @method startChat
         * @param Prometheus.Models.User user
         */
        startChat(user){
            Logger.debug('Prometheus.Controllers.App::startChat');
            let _self = this;
            Logger.debug(user);
            Logger.debug(_self);

            let options = {
                query:'((Chatroom.type : private) AND (((ownedby.id : '+_self.get('currentUser.user.id')+') AND (conversers.id : '+user.id+')) OR ((ownedby.id : '+user.id+') AND (conversers.id : '+_self.get('currentUser.user.id')+'))))'
            };

            _self.get('store').query('chatroom',options).then(function(data){
               Logger.debug(data);
               let chatrooms = _self.get('chatrooms');
               Logger.debug(chatrooms);
               if (chatrooms === undefined) {
                   Logger.debug('Initing chatrooms');
                   _self.set('chatrooms',data);
               } else {
                   Logger.debug('Adding room');
                   chatrooms.pushObject(data.get('firstObject'));
                   _self.set('chatrooms',chatrooms);
               }
            });
            // If no chatroom was found then create one

            Logger.debug(options);
            Logger.debug('-Prometheus.Controllers.App::startChat');
        },

        /**
         * This function is called when a new message arrives for a user
         *
         * @method newMessage
         * @param message
         */
        newMessage(message){
            Logger.debug('Prometheus.Controllers.App::newMessage');
            Logger.debug(message);
            Logger.debug('-Prometheus.Controllers.App::newMessage');
        }
    }

});