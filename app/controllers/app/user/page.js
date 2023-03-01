/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import window from 'ember-window-mock';
import { computed, action } from '@ember/object';

/**
 * This controller is used to manage the user detail/page view
 *
 * @class AppUserPageController
 * @namespace Prometheus.Controllers
 * @module App.Users
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@gmail.com>
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

    /**
    * Open Projects of the user.
    *
    * @property openProjects
    * @type ProjectModel
    * @for User
    * @private
    */
    @computed('model.projects')
    get openProjects() {
        return (this.model.projects.filter((project) => (project.done === "0"))).length;
    }

    /**
    * Closed Projects of the user.
    *
    * @property closedProjects
    * @type ProjectModel
    * @for User
    * @private
    */
    @computed('model.projects')
    get closedProjects() {
        return (this.model.projects.filter((project) => (project.done === "1"))).length;
    }

    /**
    * Open Issues of the user.
    *
    * @property openIssues
    * @type ProjectModel
    * @for User
    * @private
    */
     @computed('issues')
     get openIssues() {
         return (this.issues.filter((issue) => (issue.issuestatus.get('done') === "0"))).length;
     }

    /**
    * Closed Projects of the user.
    *
    * @property closedIssues
    * @type ProjectModel
    * @for User
    * @private
    */
     @computed('issues')
     get closedIssues() {
         return (this.issues.filter((issue) => (issue.issuestatus.get('done') === "1"))).length;
     }     
}