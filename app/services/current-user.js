/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject } from '@ember/service';

/**
 * This is a service that provides currentUser. This service can be injected
 * anywhere in the application
 *
 * @class CurrentUser
 * @namespace Prometheus.Services
 * @extends Ember.service
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Service.extend({

    /**
     * The session service
     *
     * @property session
     * @type Service
     * @for CurrentUser
     * @private
     */
    session: inject(),

    /**
     * The store is injected as a service
     *
     * @property store
     * @type Service
     * @for CurrentUser
     * @private
     */
    store: inject(),

    /**
     * This function is called to load the currentUser
     *
     * @method loadUser
     * @public
     */
    loadUser: async function () {
        if (this.session.isAuthenticated) {
            // Retrieve the current user's object from the API
            const user = await this.store.queryRecord('user', { include: 'dashboard,aclPermissions,projects', me: true });
            // Set the retrieved user in the current object
            this.set('user', user);

            this.setUserAttributes(user);
        }
    },

    /**
     * This function is used to set the date joined and account status for the user
     * if the user is invited, then set the account status to active
     * if the user is not joined yet, then set the date joined to the current date and time
     *
     * @method setUserAttributes
     * @param {Object} user - The user object
     * @public
     */
    setUserAttributes: async function (user) {
        if(!user.dateJoined) {
            user.dateJoined = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        if(user.accountStatus === 'invited') {
            user.accountStatus = 'active';
        }

        await user.save();
    }

});