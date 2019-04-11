/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';
import _ from 'lodash';

/**
 * This is the route to load the task board for a project
 *
 * @class Board
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    afterModel(){
        Logger.debug('Prometheus.Routes.Project.Board->afterModel');

        let _self = this;

        // get the project identifier
        let projectId = _self.paramsFor('app.project').project_id;
        // depending on whether the page was refreshed or a route
        // transition was invoked the params might not have been
        // initiated
        if (projectId === undefined && _self.context !== undefined) {
            if (_self.context.project_id !== undefined) {
                projectId = _self.context.project_id;
            }
        }

        // Prepare the milestone params
        let _milestoneOptions = {
            query:'(Milestone.projectId : '+projectId+')',
            order: 'Milestone.endDate',
            rels: 'none'
        };

        Logger.debug('-Prometheus.Routes.Project.Board->afterModel');
        // Fetch all the milestones
        return hash({
            milestones : _self.store.query('milestone',_milestoneOptions)
        }).then(function(results){
            // For each milestone that is still open fetch the issues
            _self.set('milestones',results.milestones);
            let Promises = {};
            let count = 0;
            results.milestones.forEach(function(milestone){
                if (milestone.get('status') === 'in_progress' ||
                    milestone.get('status') === 'planned') {
                    let __issueOptions = {
                        query: '((Issue.milestoneId : '+milestone.get('id')+') AND (Issue.projectId : '+projectId+'))',
                        rels: 'issuetype,assignedTo',
                        limit: -1
                    };

                    Promises['milestone'+count] = _self.store.query('issue',__issueOptions);
                    count++;
                }
            });

            let _backlogOptions = {
                query: '((Issue.projectId : '+projectId+') AND ((Issue.milestoneId EMPTY) OR (Issue.milestoneId NULL)))',
                rels: 'issuetype,assignedTo',
                limit: -1
            };

            Promises['backlog'] = _self.store.query('issue',_backlogOptions);

            return hash(Promises).then(function(issues) {
                Logger.debug('Fetched the issues');

                _.forEach(issues,function (milestoneIssues,idx) {

                    if (idx === 'backlog') {
                        _self.set('backlog',milestoneIssues);
                    } else {
                        let milestoneId = milestoneIssues.get('firstObject.milestoneId');
                        if (milestoneId !== undefined) {
                            _self.get('milestones').findBy('id', milestoneId).set('issues', milestoneIssues);
                        }
                    }
                });
            });

        });
    },
    /**
     * This controller is used to setup the controller for this
     * route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        Logger.debug('Prometheus.Routes.Board::setupController');

        let _self = this;
        let params = _self.paramsFor('app.project');

        let i18n = _self.get('i18n');
        controller.set('i18n',i18n);
        controller.set('projectId',params.project_id);

        controller.set('milestones',_self.get('milestones'));
        controller.set('backlog',_self.get('backlog'));
        Logger.debug('-Prometheus.Routes.Board::setupController');
    },
});