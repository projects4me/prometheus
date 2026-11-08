/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import registry from 'prometheus/utils/developer/component-registry';

/**
 * One entry of the Developer Component Library. Resolves the registry entry
 * named in the url; an unknown name resolves to `entry: null` so the template
 * shows an error box instead of failing the transition.
 *
 * @class AppDeveloperComponentRoute
 * @namespace Prometheus.Routes
 * @module App.Developer
 * @extends AppRoute
 */
export default class AppDeveloperComponentRoute extends AppRoute {

    /**
     * @method model
     * @param {Object} params
     * @param {string} params.name
     * @returns {{name: string, entry: Object|null, first: Object|null}}
     * @public
     */
    model({ name }) {
        return { name, entry: registry.find(name), first: registry.first };
    }

    /**
     * Only the model is set; see AppDeveloperRoute.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
