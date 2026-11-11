/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { inject as injectController } from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';

/**
 * This controller provides the base of the controllers that work on the data of a project: the issue, member
 * lists of the project controller and the # issue search of the editors.
 *
 * It is a native class, not a mixin, because ember-concurrency only compiles `task(async () => {})` on a class
 * property.
 *
 * @class ProjectRelatedController
 * @namespace Prometheus.Controllers
 * @module Prometheus
 * @extends Prometheus.Controllers.PrometheusCreateController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ProjectRelatedController extends PrometheusCreateController {

    /**
     * This is the controller of the project, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project
     * @for ProjectRelatedController
     * @public
     */
    @injectController('app.project') projectController;

    /**
     * The list of issues associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for ProjectRelatedController
     * @private
     */
    get issuesList() {
        return this.projectController.get('issuesList');
    }

    /**
     * The list of users associated with a project
     *
     * @property membersList
     * @type Array
     * @for ProjectRelatedController
     * @private
     */
    get membersList() {
        return this.projectController.get('membersList');
    }

    /**
     * This function loads the search data
     *
     * @param query
     * @return {RSVP.Promise|Test.Promise|*}
     */
    loadSearchData(query) {
        let projectId = this.trackedProject.getProjectId();
        let options = {
            fields: 'Issue.id,Issue.issueNumber,Issue.subject,Issue.status,Issue.priority,Issue.projectShortcode',
            query: '((Issue.issueNumber CONTAINS ' + query + ') AND (Issue.projectId : ' + projectId + '))',
            limit: 5,
            sort: 'Issue.issueNumber',
            order: 'DESC'
        };
        return new RSVP.Promise((resolve) => {
            resolve(this.store.query('issue', options));
        });
    }

    /**
     * This is the task that is used to perform the search.
     *
     * @property search
     * @type task
     * @public
     */
    search = task(async (query) => {
        await timeout(500);
        return this.loadSearchData(query);
    });
}
