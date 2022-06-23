/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject } from '@ember/service';

/**
 * This is the application route, in EmberJs the application route is the main
 * route, this is executed no matter what. We have to use this
 *
 * @class Application
 * @namespace Prometheus.Routes
 * @extend Route
 * @uses ApplicationRouteMixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Route.extend({

    routeAfterAuthentication: 'app',
    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for Application
     * @public
     */
    intl: inject(),

    /**
     * The router service is used in order to redirect to other route
     *
     * @property intl
     * @type Ember.Service
     * @for Application
     * @public
     */
    router: inject(),

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    session: inject(),

    /**
     * This function get triggered before a model fetch is called, this is
     * called every time and we routing the user to the signin route if a user
     * is not authenticated
     *
     * @method afterModel
     * @private
     */
    beforeModel: function () {
        this._super(...arguments);
        this.intl.setLocale(['en-us']);
        let route = '';
        let currentUrl = this.router.location.concreteImplementation.location.pathname;
        if (this.session.isAuthenticated) {
            route = (currentUrl != '/') ? currentUrl : 'app';
        } else if (!this.session.isAuthenticated) {
            this.session['oldRequestedUrl'] = currentUrl;
            route = 'signin';
        }
        this.router.transitionTo(route);
    },
});