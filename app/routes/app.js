/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { UnauthorizedError } from '@ember-data/adapter/error';

/**
 * This is the app route, the app route is used
 *
 * @class App
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @uses AuthenticatedRouteMixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Route.extend({

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for App
     * @public
     */
    session: inject(),

    /**
     * The route name on which user will authenticate for the appliation.
     * 
     * @property authenticationRoute
     * @type string
     * @for App
     * @public
     */
    authenticationRoute: 'signin',
    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for App
     * @private
     */
    intl: inject(),

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for App
     * @public
     */
    currentUser: inject(),

    /**
     * The store service that is used to interact ember data APIs.
     *
     * @property store
     * @type Ember.Service
     * @for App
     * @public
     */
    store: inject(),

    /**
     * The Ember router service.
     *
     * @property router
     * @type Ember.Service
     * @for App
     * @public
     */
    router: inject(),

    /**
     * Acl service used to maintain allowed resources for current loggedin user and
     * check user access on different resources.
     * 
     * @property acl
     * @type Ember.Service
     * @for App
     * @public
     */
    acl: inject(),

    /**
     * This service is used to different types of errors.
     * 
     * @property errorManager
     * @type Ember.Service
     * @for App
     * @protected
     */
    errorManager: inject(),

    /**
     * The trackedProject service provides the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for App
     * @private
     */
    trackedProject: inject(),

    /**
     * The notifications service
     *
     * @property notifications
     * @type Ember.Service
     * @for App
     * @private
     */
    notifications: inject(),

    /**
     * The breadcrumb service.
     * 
     * @property breadcrumb
     * @type Ember.Service
     * @for App
     * @private
     */
    breadcrumb: inject(),

    /**
     * Blocks transitions when a controller is dirty or an async operation is
     * in progress. See NavigationGuardService for full usage docs.
     *
     * @property navigationGuard
     * @type Prometheus.Services.NavigationGuard
     * @for App
     * @private
     */
    navigationGuard: inject(),
    
    /**
     * This function is called by EmberJs before it retrieves the model. In this method
     * we're redirecting user to loading assets route if the intial data is not loaded.
     *
     * @method beforeModel
     * @public
     * @todo Use registerRouteEvent in future when the Admin panel for Prometheus ACL will be created.
     */
    beforeModel(transition) {
        this.session.requireAuthentication(transition, this.authenticationRoute);

        let loadingAssetsController = this.controllerFor('app.loading-assets');

        if (!loadingAssetsController.get('dataLoaded')) {
            this.router.transitionTo('app.loading-assets');
        }

        this.registerRouteEvent();
    },

    /**
     * Registers a single `routeWillChange` listener (once per session) that
     * acts as the application-wide navigation guard. Delegates the blocked-state
     * check to `_isNavigationBlocked` and hands off prompting to the service.
     *
     * @method registerRouteEvent
     * @protected
     */
    registerRouteEvent() {
        if (this.router.has('routeWillChange')) {
            return;
        }

        this.router.on('routeWillChange', (transition) => {
            if (!transition.from || transition.isAborted) {
                return;
            }

            if (this.navigationGuard._bypassOnce) {
                this.navigationGuard._bypassOnce = false;
                return;
            }

            if (this._isNavigationBlocked(transition)) {
                this.navigationGuard.confirmTransition(transition);
            }
        });
    },

    /**
     * Returns true when the transition should be blocked. Checks two sources:
     * the `isDirty` flag on the departing route's controller, and the
     * navigationGuard service (async ops registered via navigationGuard.register).
     *
     * controllerFor() may throw for routes with no explicit controller — treat
     * that as clean state.
     *
     * @method _isNavigationBlocked
     * @param {Transition} transition
     * @return {Boolean}
     * @private
     */
    _isNavigationBlocked(transition) {
        let controllerIsDirty = false;
        try {
            let controller = this.controllerFor(transition.from.name);
            controllerIsDirty = Boolean(controller?.isDirty);
        } catch (_e) {
            // route has no controller — treat as clean
        }

        return controllerIsDirty || this.navigationGuard.isDirty;
    },

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.App} controller the controller object for this route
     * @protected
     */
    setupController: function (controller) {
        Logger.debug('Prometheus.App.Route::setupController()');

        let loadingAssetsController = this.controllerFor('app.loading-assets');
        if(loadingAssetsController.get('dataLoaded')) {
            controller.set('roles', loadingAssetsController.get('roles'));
            controller.set('users', loadingAssetsController.get('users'));
            controller.set('projects', loadingAssetsController.get('projects'));
            controller.detectTimezoneChange();
        }

        Logger.debug('-Prometheus.App.Route::setupController()');
    },
    actions: {
        /**
         * This event is triggered when user will get error from one of the model hooks of the ember e.g. afterModel, beforeModel
         * or model. In this event we're invalidating the session if the error has status code of 401 or type "UnauthorizedError" and
         * for the other errors having different type of status code e.g. 403 or 404 we're returning true, that will allow Ember to
         * render the error template. 
         * 
         * @param {*} error 
         * @param {*} transition 
         * @returns 
         */
        error(error, transition) {
            if (error instanceof UnauthorizedError) {
                this.session.invalidate();
            } else {
                return true;
            }
        }
    }
});