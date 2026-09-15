/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const SIGN_IN_ROUTE_NAMES = ['signin', 'signin.index'];

/**
 * Single source of truth for when Sign-In controls may initiate auth or navigate
 * to the sign-in flow. Prevents auth API calls while post-authentication
 * routing to the app shell is in progress or when the user is on the app route.
 *
 * @class SignInControlService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class SignInControlService extends Service {

    /**
     * The router service provides access to route
     *
     * @property router
     * @type Ember.Service
     * @for SignInControlService
     * @private
     */
    @service router;

    /**
     * The session service.
     * 
     * @property session
     * @type Ember.Service
     * @for SignInControlService
     * @private
     */
    @service session;

    /**
     * True while the sign-in form has an in-flight authenticate() call or until
     * post-auth navigation away from signin completes.
     *
     * @property isAuthenticating
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    @tracked isAuthenticating = false;

    /**
     * True while a transition targets the authenticated app shell.
     *
     * @property isNavigatingToApp
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    @tracked isNavigatingToApp = false;

    /**
     * Whether the router listeners have been registered.
     *
     * @property _routerListenersRegistered
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    _routerListenersRegistered = false;

    /**
     * Constructor for the SignInControlService.
     *
     * @constructor
     * @for SignInControlService
     * @private
     */
    constructor() {
        super(...arguments);
        this._registerRouterListeners();
    }

    /**
     * Routes where the primary Sign-In form is shown and may submit credentials.
     *
     * @property isOnSignInRoute
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    get isOnSignInRoute() {
        let routeName = this.router.currentRouteName;
        return SIGN_IN_ROUTE_NAMES.includes(routeName);
    }

    /**
     * Whether the sign-in page submit control may initiate authentication.
     *
     * @property canSubmitSignIn
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    get canSubmitSignIn() {
        if (!this.isOnSignInRoute) {
            return false;
        }

        if (this.session.isAuthenticated) {
            return false;
        }

        if (this.isAuthenticating || this.isNavigatingToApp) {
            return false;
        }

        return true;
    }

    /**
     * Whether the app header Sign-In affordance may be activated. The app shell
     * is not an eligible sign-in entry route.
     *
     * @property isHeaderSignInEnabled
     * @type Boolean
     * @for SignInControlService
     * @private
     */
    get isHeaderSignInEnabled() {
        return false;
    }

    /**
     * Begins the authentication process.
     *
     * @method beginAuthentication
     */
    beginAuthentication() {
        this.isAuthenticating = true;
    }

    /**
     * Clears in-flight authentication state after a failed sign-in attempt.
     *
     * @method endAuthentication
     */
    endAuthentication() {
        this.isAuthenticating = false;
    }

    /**
     * Keeps Sign-In disabled after success until routing settles.
     *
     * @method markAwaitingPostAuthNavigation
     */
    markAwaitingPostAuthNavigation() {
        this.isAuthenticating = true;
        this.isNavigatingToApp = true;
    }

    /**
     * Registers the router listeners.
     *
     * @method _registerRouterListeners
     * @private
     */
    _registerRouterListeners() {
        if (this._routerListenersRegistered) {
            return;
        }

        this._routerListenersRegistered = true;

        this.router.on('routeWillChange', (transition) => {
            if (this._transitionTargetsAppShell(transition)) {
                this.isNavigatingToApp = true;
            }
        });

        this.router.on('routeDidChange', () => {
            this.isNavigatingToApp = false;
            if (!this.isOnSignInRoute || this.session.isAuthenticated) {
                this.isAuthenticating = false;
            }
        });
    }

    /**
     * Checks if the transition targets the app shell.
     *
     * @method _transitionTargetsAppShell
     * @param {Ember.Transition} transition
     * @returns {Boolean}
     * @private
     */
    _transitionTargetsAppShell(transition) {
        let targetName = transition?.to?.name;
        if (!targetName) {
            return false;
        }

        return targetName === 'app' || targetName.startsWith('app.');
    }
}
