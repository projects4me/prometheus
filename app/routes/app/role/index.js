/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The roles index, shown while no role is open: it opens the first listed role in place of itself, so Back does not
 * return to it, and otherwise tells that no role matches
 *
 * @class AppRoleIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Role
 * @extends App
 */
export default class AppRoleIndexRoute extends App {
    /**
     * Opens the first listed role: from the browser's list once it has loaded one, otherwise from the first page the
     * roles route loaded on this visit. While the list loads, the browser opens it when the load completes.
     *
     * @method redirect
     * @protected
     */
    redirect() {
        let browser = this.controllerFor('app.role');
        let first;
        if (browser.roleList.params) {
            first = browser.isListLoading ? null : browser.roles[0];
        } else {
            let records = this.modelFor('app.role')?.firstPage?.records;
            first = records ? (records.toArray?.() ?? [...records])[0] : null;
        }
        if (first) {
            this.replaceWith('app.role.page', first.id);
        }
    }

    /**
     * Clears the open role in the browser
     *
     * @method setupController
     * @protected
     */
    setupController() {
        this.controllerFor('app.role').selectedRoleId = null;
    }
}
