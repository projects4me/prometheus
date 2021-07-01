/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject } from '@ember/service';


/**
 * This is the app route, the app route is used
 *
 * @class AppRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @uses UnauthenticatedRouteMixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Route.extend({

    routeIfAlreadyAuthenticated: 'app',

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    session:inject(),
    
    beforeModel() {
        this.session.prohibitAuthentication(this.routeIfAlreadyAuthenticated);
    }
});
