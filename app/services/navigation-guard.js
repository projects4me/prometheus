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
 * Messenger prompt. Confirming retries the transition; cancelling keeps the user
 * on the current page.
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
     * Set to true just before retrying an aborted transition so the resulting
     * routeWillChange event is skipped, preventing an infinite prompt loop.
     *
     * @property _bypassOnce
     * @type {Boolean}
     * @private
     */
    _bypassOnce = false;

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
     * The last aborted transition. Updated on every routeWillChange call so the
     * confirm action always retries the most recent one.
     *
     * @property _pendingTransition
     * @type {Transition|null}
     * @private
     */
    _pendingTransition = null;

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
     * Aborts the transition and shows a Messenger "Leave / Stay" prompt.
     * Called by the App route — not needed directly in components or controllers.
     *
     * @method confirmTransition
     * @param {Transition} transition
     * @public
     */
    confirmTransition(transition) {
        transition.abort();

        this._pendingTransition = transition;

        // Only one prompt at a time. Subsequent calls update _pendingTransition
        // above and return so no extra Messenger dialogs are stacked.
        if (this._isPrompting) {
            return;
        }
        this._isPrompting = true;

        let _self = this;
        let intl = this.intl;

        let message = new Messenger().post({
            message: intl.t('global.form.navigationBlocked').toString(),
            type: 'warning',
            showCloseButton: false,
            hideAfter: 3,
            actions: {
                confirm: {
                    label: intl.t('global.form.leaveAnyway').toString(),
                    action: function () {
                        let pendingTransition = _self._pendingTransition;

                        message.cancel();
                        _self._isPrompting = false;
                        _self._pendingTransition = null;
                        _self.clear();

                        if (pendingTransition) {
                            _self._bypassOnce = true;
                            pendingTransition.retry();
                        }
                    },
                },
                cancel: {
                    label: intl.t('global.form.stayOnPage').toString(),
                    action: function () {
                        message.cancel();
                        _self._isPrompting = false;
                        _self._pendingTransition = null;
                    },
                },
            },
        });
    }
}
