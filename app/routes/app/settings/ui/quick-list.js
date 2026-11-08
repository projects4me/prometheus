/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The QuickList page of the Settings > Developer > UI section. The showcase
 * content is added by a later issue.
 *
 * @class AppSettingsUiQuickListRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsUiQuickListRoute extends AppRoute {

    /**
     * The page has no model of its own and needs none of the users, roles and
     * projects that AppRoute hands to its controller, so only the model is set.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.Ui.QuickList} controller
     * @param {*} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
