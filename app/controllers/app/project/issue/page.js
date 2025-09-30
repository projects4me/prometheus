/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { inject as controller } from '@ember/controller';

/**
 * This controller is used to manage the issues detail/page view
 *
 * @class AppProjectIssuePageController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssuePageController extends PrometheusController {
    /**
     * We are pre-loading the project issues and the users in the
     * system when a use navigates to the project view. Inside the
     * this page we are simply fetching the information stored in
     * the project controller. For that purpose we are loading injecting
     * the project controller controller inside this controller.
     *
     * @property projectController
     * @type Prometheus.Controllers.Project
     * @for Create
     * @private
     */
    @controller('app.project') projectController;

    /**
     * Query params that the controller support.
     *
     * @property queryParams
     * @type Array
     * @for AppProjectIssuePageController
     * @public
     */
    queryParams = ['s_id'];
}