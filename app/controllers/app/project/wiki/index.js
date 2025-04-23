/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { action } from '@ember/object';

/**
 * The controller for the wiki route, it is loaded when a user tried to navigate to the route
 * wiki
 * e.g. acme.projects4.me/app/1/wiki
 * By default this controller is configured to load the project selection
 *
 * @class AppProjectWikiIndexController
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectWikiIndexController extends PrometheusController {

    /**
     * This function is used to navigate the user to the create route
     *
     * @method create
     * @public
     */
    @action create() {
        this.transitionToRoute('app.project.wiki.create', { shortcode: this.trackedProject.shortCode });
    }
}