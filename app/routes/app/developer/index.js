/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import registry from 'prometheus/utils/developer/component-registry';

/**
 * Redirects /app/developer to the first registered component.
 *
 * @class AppDeveloperIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Developer
 * @extends AppRoute
 */
export default class AppDeveloperIndexRoute extends AppRoute {

    /**
     * @method redirect
     * @public
     */
    redirect() {
        let first = registry.first;
        if (first && this.controllerFor('app.loading-assets').get('dataLoaded')) {
            this.router.replaceWith('app.developer.component', first.name);
        }
    }

    /**
     * Only the (empty) model is set; see AppDeveloperRoute.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {*} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
