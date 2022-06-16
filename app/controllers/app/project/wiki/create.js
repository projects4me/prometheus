/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as controller } from '@ember/controller';
import { computed } from '@ember/object';
import _ from "lodash";
import { htmlSafe } from '@ember/template';

/**
 * The controller for the wiki create route, it is loaded when a user clicks on
 * create button
 * e.g. acme.projects4.me/app/1/wiki/create
 *
 * @class AppWikiCreateController
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppWikiCreateController extends PrometheusCreateController.extend(ProjectRelated) {

    /**
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module = 'wiki';

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    @controller('app') appController;

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    @computed('appController.usersList')
    get usersList() {
        return this.appController.get('usersList');
    }

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.wiki.created', {
            name: model.get('name')
        }));
    }

    /**
     * This function navigate a user to the issue detail page
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        this.transitionToRoute('app.project.wiki.page', {
            project_id: model.get('projectId'),
            wiki_name: model.get('name')
        });
    }

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 4);
    }

    /**
     * This function navigates a use to the issue list view.
     *
     * @method afterCancel
     * @param projectId
     * @protected
     */
    afterCancel() {
        let projectId = this.target.currentState.routerJsState.params["app.project"].project_id;
        this.transitionToRoute('app.project.wiki', { project_id: projectId });
    }
}