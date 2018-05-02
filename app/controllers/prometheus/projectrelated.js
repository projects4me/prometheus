/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Mixin from '@ember/object/mixin';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';

/**
 * This controller provides the base
 *
 * @class ProjectRelated
 * @namespace Prometheus.Mixins
 * @module Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
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
        return this.get('projectController').get('issuesList');
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
        return this.get('projectController').get('membersList');
    }),

});