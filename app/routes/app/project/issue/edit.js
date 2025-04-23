/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Create from "prometheus/routes/app/project/issue/create";
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';
import format from "prometheus/utils/data/format";

/**
 * The issues edit route
 *
 * @class Edit
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Create.extend({

    /**
     * This is the template that we want to display for this the Edit view
     *
     * @property templateName
     * @for Edit
     * @type String
     * @public
     */
    templateName: 'app/project/issue/create',

    /**
     * We are using dynamic segments and since model is not called
     * again for a route that is using dynamic segment we are relying
     * on the afterModel hook so that the controller waits since we
     * return a Promise.
     *
     * @method model
     * @param {Object} params
     * @return Prometheus.Issue
     * @private
     */
    afterModel(model){
        Logger.debug('Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        let _self = this;

        let projectId = _self.trackedProject.getProjectId();
        let issueNumber = model.issue_number;

        let projectOptions = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes,issuestatuses',
            sort: "members.name",
            limit: -1
        };

        let issueOptions = {
            query: '(Issue.issueNumber : '+issueNumber+')',
            sort : 'Issue.issueNumber',
            order: 'ASC',
            limit: -1,
        };

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        return hashSettled({
            issue: _self.get('store').query('issue',issueOptions),
            project: _self.store.query('project',projectOptions)
        }).then(function(results){
            let data = extractHashSettled(results);
            _self.set('issue',data.issue.objectAt(0));
            const issueDescription = _.clone(_self.issue.description);
            _self.set('issueDescription',issueDescription);
            _self.set('project',data.project.objectAt(0));
            _self.set('types',data.project.objectAt(0).get('issuetypes'));
            _self.set('statuses',data.project.objectAt(0).get('issuestatuses'));
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "issue"
            })
        });
    },

    /**
     * The setupController hook for issue edit route.
     * 
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     */
    setupController: function (controller) {
        Logger.debug('Prometheus.Routes.App.Project.Issue.Create::setupController');

        let _self = this;

        let params = this.paramsFor('app.project.issue.edit');

        this.set('breadCrumb', { title: '#' + params.issue_number, record: true });
        controller.set('model', _self.get('issue'));
        controller.set('project', _self.get('project'));
        controller.set('types', _self.get('types'));
        controller.set('statuses', _self.get('statuses'));
        controller.set('issueDescription', _self.get('issueDescription'));

        let priority = (new format(this)).getList('views.app.issue.lists.priority');
        controller.set('priority', priority);

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Create::setupController');
    },

});