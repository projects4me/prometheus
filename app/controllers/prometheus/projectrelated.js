/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Mixin from '@ember/object/mixin';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';

/**
 * This controller provides the base
 *
 * @class ProjectRelated
 * @namespace Prometheus.Mixins
 * @module Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
/* eslint-disable ember/no-new-mixins */ 
export default Mixin.create({

    /**
     * This is the controller of the project, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project
     * @for ProjectRelated
     * @public
     */
    projectController: injectController('app.project'),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for ProjectRelated
     * @private
     */
    issuesList: computed('projectController.issuesList', function(){
        return this.projectController.get('issuesList');
    }),

    /**
     * This is a computed property in which gets the list of user
     * associated with a project
     *
     * @property memberList
     * @type Array
     * @for ProjectRelated
     * @private
     */
    membersList: computed('projectController.membersList', function(){
        return this.projectController.get('membersList');
    }),

    /**
     * This function loads the search data
     *
     * @param query
     * @return {RSVP.Promise|Test.Promise|*}
     */
     loadSearchData(query) {
        let _self = this;
        let projectId = this.trackedProject.getProjectId();
        let options = {
            fields: 'Issue.id,Issue.issueNumber,Issue.subject,Issue.status,Issue.priority,Issue.projectId',
            query: '((Issue.issueNumber CONTAINS ' + query +') AND (Issue.projectId : '+ projectId +'))',
            limit: 5,
            sort:'Issue.issueNumber',
            order: 'DESC'
        };
        return new RSVP.Promise((resolve) => {
            resolve(_self.get('store').query('issue', options));
        });
    },
    /**
     * This is the task that is used to perform the search.
     *
     * @property search
     * @type task
     * @public
     */
    search: task(function* (query) {
        yield timeout(500);
       return this.loadSearchData(query);
    })

});