/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from "prometheus/config/environment";
import getCurrentUrl from "prometheus/utils/location/current-url";
import { restartPaceOnTransition } from "prometheus/utils/ui/pace-router";

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
export default class ApplicationRoute extends Route {

    routeAfterAuthentication = 'app';

    /**
     * Wires the router service to the Pace progress bar once the route exists, so
     * nothing touches the router before the application has set it up.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        restartPaceOnTransition(this.router);
    }

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for Application
     * @public
     */
    @service intl;

    /**
     * The router service is used in order to redirect to other route
     *
     * @property intl
     * @type Ember.Service
     * @for Application
     * @public
     */
    @service router;

    /**
     * The session service (services/session.js) that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    @service session;

    /**
     * The translations service that loads the backend translations before the app renders
     *
     * @property translations
     * @type Ember.Service
     * @for Application
     * @public
     */
    @service translations;

    /**
     * This function get triggered before a model fetch is called, this is
     * called every time. It loads the translations, then routes the user to the
     * signin route if a user is not authenticated
     *
     * @method beforeModel
     * @private
     */
    async beforeModel() {
        super.beforeModel(...arguments);
        try {
            await this.restoreAndRedirect();
        } finally {
            // the static skeleton from index.html is no longer needed, whatever happened
            document.querySelector('[data-boot-loader]')?.remove();
        }
    }

    /**
     * Restores the session, loads the translations and redirects to the signin
     * route or the requested one, unless the route is public
     *
     * @method restoreAndRedirect
     * @private
     */
    async restoreAndRedirect() {
        // restore the persisted session and enable its sign-in/sign-out handlers
        await this.session.setup();
        await this.translations.load();
        let route = '';
        let currentUrl = getCurrentUrl(this.router);

        // Create URL object
        let url = new URL(currentUrl, window.location.origin);
        let routeName = url.pathname?.split('/')[1];

        // If public route then no need to check for authentication
        let publicRoutes = ENV.publicRoutes;
        if (publicRoutes.includes(routeName)) {
            return;
        }

        if (this.session.isAuthenticated) {
            route = (currentUrl != '/') ? currentUrl : 'app';
        } else if (!this.session.isAuthenticated) {
            (currentUrl != '/') && (this.session['oldRequestedUrl'] = currentUrl);
            route = 'signin';
        }
        this.router.transitionTo(route);
    }
}
