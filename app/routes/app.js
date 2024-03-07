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
     * This function is called by EmberJs before it retrieves the model. In this method
     * we're redirecting user to loading assets route if the intial data is not loaded.
     *
     * @method beforeModel
     * @public
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
     * This function is used to register router service event which will be used to
     * check user access on the route on which they are trying to enter. If the user
     * will have accesss to that route then the transition will continue and if not then
     * the user is routed to access-denied route.
     * 
     * @method registerRouteEvent
     * @protected
     */
    registerRouteEvent() {
        let _self = this;
        let eventName = 'routeWillChange';
        let isEventRegistered = (_self.router.has(eventName));
        let loadingAssetsController = this.controllerFor('app.loading-assets');

        if (!isEventRegistered) {
            _self.router.on(eventName, (transition) => {
                if (loadingAssetsController.get('dataLoaded')
                    && !_self.acl.hasRouteAccess(transition.to.name)) {
                    _self.router.transitionTo('app.access-denied');
                }
            });
        }
    },

    /**
     * This function catches any issue thrown by the _loadCurrentUser function and
     * invalidates the session
     *
     * @method sessionAuthenticated
     * @protected
     */
    sessionAuthenticated() {
        this._super(...arguments);
        this.loadCurrentUser().catch(() => this.session.invalidate());
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
        controller.set('roles', loadingAssetsController.get('roles'));
        controller.set('users', loadingAssetsController.get('users'));
        controller.set('projects', loadingAssetsController.get('projects'));

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