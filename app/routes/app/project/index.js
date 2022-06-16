/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * The wiki route
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The project Id
     *
     * @property projectId
     * @type String
     * @for Index
     * @private
     */
    projectId: null,

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.Project} controller the controller object for this route
     * @private
     * @todo move the loading of related to afterModel
     */
    setupController:function(controller){
        Logger.debug('AppProjectIndexRoute::setupController');
        let _self = this;
        // If the user navigated directly to the wiki project or page then lets setup the project id
        let projectId = _self.paramsFor('app.project').project_id;
        let projectName = null;

        Logger.debug(projectId);
        Logger.debug(projectName);

        _self.loadIssuesTime(projectId,controller);
        _self.loadActivities(projectId,controller);

        let options = {
//      fields: "Project.id,Project.name",
            query: "(Project.id : "+projectId+")",
            rels : 'members,conversations,createdBy,owner,memberships,roles',
            sort: "conversations.dateModified",
            order: 'ASC',
            limit: -1
        };

        Logger.debug('Retreiving the project with options ');
        Logger.debug(options);

        _self.store.query('project',options).then(function(data){
            if (projectId !== null)
            {
                projectName = data.findBy('id',projectId).get('name');
                controller.set('projectId',projectId);
                controller.set('projectName',projectName);
            }
            controller.set('model',data.objectAt(0));
        });

        controller.send('resetNewMilestone');
    },


    /**
     * This function is used to retrieve and process the issues related to a project
     * There are two reasons that the issues are being loaded separately and not
     * part of the ordinal call sent to retrieve the project information. The first
     * reason is performance, the number of issues on a large project can easily
     * exceed 1000 issues and if we retrieve the information along with project
     * information due to the obviously complex nature of many relationships between
     * a project and other entities the retrieval cost for even a single project
     * would be in hundred of thousand of rows examined. So we only bring in the
     * information that for there are going to be one a few decade rows in total
     * with the original project retrieval call.
     * The second reason is to retrieve the related information. The API automatically`
     * retrieves the related data but is restricted to first degree relationships.
     * Second degree and above relationships are not retrieved via the default call
     * due to obvious performance and complexity constraints.
     *
     * @method loadIssuesTime
     * @param {String} projectId The identifier of the project being viewed
     * @todo Explore the possibility of using the url project/:id/:relation as it is supported by the API
     */
    loadIssuesTime:function(projectId,controller){

        let _self = this;
        let options = {
            query: "(Issue.projectId : "+projectId+")",
            sort: "Issue.dateModified",
            order: 'DESC',
            rels:'estimated,spent,project',
            limit: -1
        };

        this.store.query('issue',options).then(function(issues){
            _self.get('controller').set('issuetime',issues);

            // We have to fetch the milestone list separately as there might be a
            // project milestone with no issue associated with it
            let options = {
                query: "(Milestone.projectId : "+projectId+")",
                sort: "Milestone.startDate",
                order: 'DESC',
                rels:'none',
                limit: -1
            };
            _self.store.query('milestone',options).then(function(milestones){
                milestones.forEach(function(milestone){
                    let milestoneIssues = issues.filterBy('milestoneId',milestone.get('id'));
                    if (milestoneIssues !== undefined)
                    {
                        milestone.get('issues').pushObjects(milestoneIssues);
                    }
                });
                controller.set('milestones',milestones.toArray());
            });
        });
    },

    /**
     * This function is used to retrieve the activities related to a project. Just
     * like the loadIssuesTime function the activities are loaded separately to
     * avoid performance and complexity issues.
     *
     * @method loadActivities
     * @param {String} projectId The identifier of the project which is being viewed
     * @todo test performance and load in chunks if required.
     */
    loadActivities:function(projectId,controller){
        let _self = this;
        let options = {
            // Retrieving the activities related to a project
            query: "((Activity.relatedId : "+projectId+") AND (Activity.relatedTo : project))",
            sort: "Activity.dateCreated",
            order: 'DESC',
            // Get all the activities
            limit: -1
        };

        _self.store.query('activity',options).then(function(data){
            let activities = {};
            // Group the activities with respect to the dateCreated
            data.forEach(function(activity){
                let dateCreated = activity.get('dateCreated').substring(0,10);
                if (activities[dateCreated] !== undefined)
                {
                    activities[dateCreated]['data'].push(activity);
                }
                else {
                    activities[dateCreated] = {dateCreated:dateCreated,data:[activity]};
                }
            });

            controller.set('activities',activities);
        });
    },

});