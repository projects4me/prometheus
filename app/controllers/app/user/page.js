/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import window from 'ember-window-mock';
import { action } from '@ember/object';

/**
 * This controller is used to manage the user detail/page view
 *
 * @class AppUserPageController
 * @namespace Prometheus.Controllers
 * @module App.Users
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class AppUserPageController extends PrometheusController {

    /**
     * This function is triggered when user clicks on one of their social
     * links in order to redirect to their social profile. Here we have used 
     * mocked window object which will be used to in testing for the purpose
     * of redirection. Instead of redirecting user to their social links in testing,
     * we'll mock the open method of window object in testing to ignore redirection.
     * 
     *
     * @method redirectToSocialLink
     * @param {String} url url, that the user want to redirects to
     * @return void
     * @public
     */
    @action redirectToSocialLink(url) {
        Logger.debug('+Prometheus.Controllers.App.User.Page::redirectToSocialLink');
        window.open(url, '_blank');
        Logger.debug('-Prometheus.Controllers.App.User.Page::redirectToSocialLink');
    }
}