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
 * @class AppProjectWikiController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectWikiController extends PrometheusController {

    /**
     * This is the tree that we use in order to maintain the list of wiki pages for a particular project
     *
     * @property tree
     * @type Object
     * @for Wiki
     * @public
     */
    tree = {};

    /**
     * This is the function that is used in order to save a wiki page
     *
     * @method save
     * @public
     */
    @action save() {
        let model = this.model.objectAt(0);
        model.save();
    }

    /**
     * This is the function that is used in order to navigate the user to the create page
     *
     * @method create
     * @public
     */
    @action create() {
        Logger.debug('Create a page for ');
        Logger.debug(this.projectId);
        this.transitionToRoute('app.project.wiki.create', { shortcode: this.trackedProject.shortCode });
    }
}