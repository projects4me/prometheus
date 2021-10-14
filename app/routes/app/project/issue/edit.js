/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Create from "prometheus/routes/app/project/issue/create";
import { hash } from 'rsvp';

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
    afterModel(model, transition){
        Logger.debug('Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        let _self = this;
        let params = transition.params;

        let projectId = params['app.project'].project_id;
        let issueNumber = model.issue_number;

        let projectOptions = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes',
            sort: "members.name",
            limit: -1
        };

        let issueOptions = {
            query: '(Issue.issueNumber : '+issueNumber+')',
            sort : 'Issue.issueNumber',
            order: 'ASC',
            limit: -1,
            //rels: 'none'
        };

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Edit::afterModel()');
        return hash({
            issue: _self.get('store').query('issue',issueOptions),
            project: _self.store.query('project',projectOptions)
        }).then(function(results){
            _self.set('issue',results.issue.objectAt(0));
            _self.set('project',results.project.objectAt(0));
            _self.set('types',results.project.objectAt(0).get('issuetypes'));
        });
    },

});