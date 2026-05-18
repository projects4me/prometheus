/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Blocks route transitions when there is work in progress that must not be lost.
 *
 * ## How it works
 *
 * The App route's `registerRouteEvent` listens to `routeWillChange` and checks
 * two sources on every transition:
 *
 *  1. `controller.isDirty` — any controller exposing this flag (e.g. create/edit
 *     forms extending PrometheusCreateController) is checked automatically.
 *     No registration needed; just set `this.isDirty = true` when the user edits.
 *
 *  2. `navigationGuard.isDirty` — for state outside controllers (async fetches,
 *     AI streaming, etc.) use the register/clear API below.
 *
 * If either source is truthy, the service aborts the transition and shows a
 * Messenger prompt. Confirming retries the aborted transition; cancelling
 * keeps the user on the current page.
 *
 * ## Usage in a component or service
 *
 *   @service navigationGuard;
 *
 *   startWork() {
 *       this.navigationGuard.register(() => this.isLoading);
 *   }
 *
 *   finishWork() {
 *       this.isLoading = false;
 *       this.navigationGuard.clear();
 *   }
 *
 * @class NavigationGuardService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class NavigationGuardService extends Service {

    /**
     * The intl service used to translate prompt messages.
     *
     * @property intl
     * @type Ember.Service
     * @for NavigationGuardService
     * @private
     */
    @service intl;

    /**
     * Live check function supplied by a component/service via register().
     * Evaluated on every routeWillChange event.
     *
     * @property _isBlockedFn
     * @type {Function|null}
     * @private
     */
    @tracked _isBlockedFn = null;

    /**
     * Set when the user confirms "Leave anyway". While true, the App route
     * does not block navigation (controller `isDirty` and registered checks
     * are ignored) until `finishConfirmedLeave()` runs on `routeDidChange`.
     *
     * @property _isConfirmingLeave
     * @type {Boolean}
     * @private
     */
    _isConfirmingLeave = false;

    /**
     * True while the Messenger prompt is open. Prevents stacking multiple dialogs
     * when routeWillChange fires once per nested route level being exited.
     *
     * @property _isPrompting
     * @type {Boolean}
     * @private
     */
    _isPrompting = false;

    /**
     * The first real route transition for the current prompt (must have intent).
     * Kept stable while `_isPrompting` so nested handlers do not replace it.
     *
     * @property _pendingTransition
     * @type {Transition|null}
     * @private
     */
    _pendingTransition = null;

    /**
     * True while the user has confirmed leaving; read by the App route.
     *
     * @property isConfirmingLeave
     * @type {Boolean}
     * @public
     */
    get isConfirmingLeave() {
        return this._isConfirmingLeave;
    }

    /**
     * Register a live check function that returns `true` when navigation should
     * be blocked. Always pair with a `clear()` call once the work is done.
     *
     *   this.navigationGuard.register(() => this.isLoading);
     *
     * @method register
     * @param {Function} isBlockedFn
     * @public
     */
    register(isBlockedFn) {
        this._isBlockedFn = isBlockedFn;
    }

    /**
     * Release the navigation guard. Call after async work completes, after a
     * successful save, or after the user explicitly discards in-progress work.
     *
     * @method clear
     * @public
     */
    clear() {
        this._isBlockedFn = null;
    }

    /**
     * Called from the App route on `routeDidChange` after a confirmed leave.
     *
     * @method finishConfirmedLeave
     * @public
     */
    finishConfirmedLeave() {
        this._isConfirmingLeave = false;
    }

    /**
     * True when the registered check function returns truthy. Read by the App
     * route's routeWillChange handler alongside `controller.isDirty`.
     *
     * @property isDirty
     * @type {Boolean}
     * @public
     */
    get isDirty() {
        return typeof this._isBlockedFn === 'function' && Boolean(this._isBlockedFn());
    }

    /**
     * Returns true when the user is navigating to the same route with the same
     * dynamic segment params (for example clicking issue create while already
     * on issue create).
     *
     * @method isSameRouteTransition
     * @param {Transition} transition
     * @return {Boolean}
     * @public
     */
    isSameRouteTransition(transition) {
        const from = transition.from;
        const to = transition.to;

        if (!from?.name || !to?.name || from.name !== to.name) {
            return false;
        }

        if (transition.queryParamsOnly) {
            return true;
        }

        const fromParams = from.params ?? {};
        const toParams = to.params ?? {};

        return JSON.stringify(fromParams) === JSON.stringify(toParams);
    }

    /**
     * Aborts the transition and shows a Messenger "Leave / Stay" prompt.
     * Called by the App route — not needed directly in components or controllers.
     *
     * @method confirmTransition
     * @param {Transition} transition
     * @public
     */
    confirmTransition(transition) {
        this._storePendingTransition(transition);
        transition.abort();

        if (this._isPrompting) {
            return;
        }
        this._isPrompting = true;

        const message = new Messenger().post({
            message: this.intl.t('global.form.navigationBlocked').toString(),
            type: 'warning',
            showCloseButton: false,
            hideAfter: false,
            actions: {
                confirm: {
                    label: this.intl.t('global.form.leaveAnyway').toString(),
                    action: () => {
                        const pendingTransition = this._pendingTransition;

                        message.cancel();
                        this._isPrompting = false;
                        this._pendingTransition = null;
                        this.clear();
                        this._isConfirmingLeave = true;

                        pendingTransition?.retry();
                    },
                },
                cancel: {
                    label: this.intl.t('global.form.stayOnPage').toString(),
                    action: () => {
                        message.cancel();
                        this._isPrompting = false;
                        this._pendingTransition = null;
                    },
                },
            },
        });
    }

    /**
     * Stores the first transition that has a router intent. Real navigations
     * always have intent; synthetic transitions from `abort()` do not.
     *
     * @method _storePendingTransition
     * @param {Transition} transition
     * @private
     */
    _storePendingTransition(transition) {
        if (!this._pendingTransition && transition.intent) {
            this._pendingTransition = transition;
        }
    }
}
