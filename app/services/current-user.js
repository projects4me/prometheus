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
    loadUser: function () {
        if (this.session.isAuthenticated) {
            // Retrieve the current user's object from the API
            return this.store.queryRecord('user', { include: 'dashboard,aclPermissions,projects', me: true }).then((user) => {
                // Set the retrieved user in the current object
                this.set('user', user);
            });
        }
    }

});