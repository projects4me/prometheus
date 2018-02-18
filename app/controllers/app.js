/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import format from "../utils/data/format";
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class App
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Controller.extend({

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verfy whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for App
     * @public
     */
    session: inject(),

    /**
     * The service that we use to maintain the currentUser
     *
     * @property currentUser
     * @type Object
     * @for App
     * @public
     */
    currentUser: inject('current-user'),

    /**
     * The related field service that is used in order to manage dropdowns and relate fields
     *
     * @property relatedField
     * @type relatedFieldService
     * @for App
     * @public
     */
    relatedFields: inject('related-fields'),

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

        newMessage(message){
            Logger.debug('Prometheus.Controllers.App::newMessage');
            Logger.debug(message);
            Logger.debug('-Prometheus.Controllers.App::newMessage');
        }


    }

});