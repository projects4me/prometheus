/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import format from "../utils/data/format";

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class App
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Ember.Controller.extend({

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verfy whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for App
     * @public
     */
    session: Ember.inject.service('session'),

    /**
     * The service that we use to maintain the currentUser
     *
     * @property currentUser
     * @type Object
     * @for App
     * @public
     */
    currentUser: Ember.inject.service('current-user'),

    /**
     * The related field service that is used in order to manage dropdowns and relate fields
     *
     * @property relatedField
     * @type relatedFieldService
     * @for App
     * @public
     */
    relatedFields: Ember.inject.service('related-fields'),

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
    rolesList: Ember.computed(function(){
        return format.getSelectList(this.get('roles'));
    }).property('roles'),

    /**
     * This is the list of users that has been extracted
     *
     * @property usersList
     * @type Ember.computed
     * @returns array
     * @public
     */
    usersList: Ember.computed(function(){
        Logger.debug(this.get('users'));
        return format.getSelectList(this.get('users'));
    }).property('users'),

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
        }

    }

});