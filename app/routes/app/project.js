/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../app";
import { hash } from 'rsvp';

/**
 * The wiki route
 *
 * @class Project
 * @namespace Prometheus.Routes
 * @module App
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The project Id
     *
     * @property projectId
     * @type String
     * @for Project
     * @private
     */
    projectId: null,

    afterModel() {
        let _self = this;
        let projectId = _self.paramsFor('app.project').projectId;
        if (projectId === undefined && _self.context !== undefined) {
            if (_self.context.projectId !== undefined) {
                projectId = _self.context.projectId;
            }
        }

        let issuesOptions = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.status,Issue.projectId",
            query: "(Issue.projectId : "+projectId+")",
            rels: "none",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        return hash({
            issues: _self.store.query('issue',issuesOptions)
        }).then(function(results){
            _self.set('issues',{});
            _self.set('issues',results.issues);
        });
    },

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.Project} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        Logger.debug('AppProjectRoute::setupController');

        let _self = this;

        // If the user navigated directly to the wiki project or page then lets setup the project id
        let projectId = this.paramsFor('app.project').projectId;
        let projectName = null;

        // self.loadIssues(projectId);
        // self.loadUsers();

        Logger.debug(projectId);
        Logger.debug(projectName);

        let options = {
            fields: "Project.id,Project.name",
            query: "(Project.id : "+projectId+")",
            rels : 'none',
            order: 'ASC',
            limit: 1
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
            controller.set('model',data.nextObject(0));
        });
        controller.set('issues',_self.get('issues'));
    },


    /**
     * This function is used to load the Issues List. This list is used in the
     * message-box to allow users to mention issues in the project.
     *
     * @method loadIssues
     * @param {String} projectId
     * @private
     */
    loadIssues:function(projectId){
        Logger.debug("AppProjectRoute::loadIssues("+projectId+")");
        let self = this;
        let module = "issue";

        let options = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.status,Issue.projectId",
            query: "(Issue.projectId : "+projectId+")",
            rels: "none",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        this.store.query(module,options).then(function(data){
            let issuesList = [];
            let issuesCount = data.get('length');

            for (let i=0; i<issuesCount;i++)
            {
                issuesList[i] = {
                    id:data.nextObject(i).get('id'),
                    name:data.nextObject(i).get('subject'),
                    number:data.nextObject(i).get('issueNumber'),
                    status:data.nextObject(i).get('status'),
                    projectId:data.nextObject(i).get('projectId')
                };
            }
            Logger.debug(issuesList);
            self.get('controller').set('issuesList',issuesList);
        });
        Logger.debug("-AppProjectRoute::loadIssues("+projectId+")");
    },

    /**
     * This function is used to load the User List. This list is used in the
     * message-box to allow users to mention the users in the system
     *
     * @method loadIssues
     * @private
     */
    loadUsers:function(){
        Logger.debug("AppProjectRoute::loadUsers()");
        let self = this;
        let module = "user";

        let options = {
            fields: "User.id,User.name",
            rels: "none",
            sort: "User.name",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        this.store.query(module,options).then(function(data){
            let usersList = [];
            let usersCount = data.get('length');

            for (let i=0; i<usersCount;i++)
            {
                usersList[i] = {
                    id:data.nextObject(i).get('id'),
                    name:data.nextObject(i).get('name'),
                };
            }
            Logger.debug(usersList);
            self.get('controller').set('usersList',usersList);
        });
        Logger.debug("-AppProjectRoute::loadUsers()");
    },


});