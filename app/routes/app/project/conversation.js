/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * This is the route to load the conversations for a project
 *
 * @class Conversation
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The requested module
     *
     * @property module
     * @type String
     * @for Conversation
     * @private
     */
    module: 'conversationroom',

    /**
     * The data for the current route
     *
     * @property data
     * @type Object
     * @for Conversation
     * @private
     */
    data: null,

    /**
     * The selected items in the list view
     *
     * @property selectedCount
     * @type Integer
     * @for Conversation
     * @private
     */
    selectedCount:0,

    /**
     * This controller is used to load the conversations that we have in the system
     *
     * @method setupController
     * @param {Prometheus.Controller.Conversation} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        Logger.debug('AppProjectConversationRoute::setupController');

        let params = this.paramsFor('app.project');

        controller.set('projectId',params.project_id);

        let options = {
            limit:-1,
            page: 0
        };

        if (params.query !== undefined && params.query !== '' &&  params.query !== null) {
            options.query = params.query;
        }

        let _conversationOptions = {
            rels: "comments",
            order: "DESC",
            sort: "comments.dateModified, Conversationroom.dateModified",
            query: "(Conversationroom.projectId : "+params.project_id+")"
        }

        this.store.query(this.module, _conversationOptions).then(function(data){
            controller.set('model',data.toArray());
        });

        let newConversation = this.store.createRecord('conversationroom',{});
        controller.set('newConversation',newConversation);

        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('module',this.module);
    },

    /**
     * This function is used to load the Issues List. This list is used in the
     * message-box to allow users to mention issues in the project.
     *
     * @method loadIssues
     * @param {String} projectId
     * @private
     */
    loadIssues(projectId){
        Logger.debug("AppProjectConversationRoute::loadIssues("+projectId+")");
        let _self = this;
        let module = "issue";

        let options = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.status,Issue.projectId",
            query: "(Issue.projectId : "+projectId+")",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        _self.store.query(module,options).then(function(data){
            let issuesList = [];
            let issuesCount = data.get('length');

            for (let i=0; i<issuesCount;i++)
            {
                issuesList[i] = {
                    id:data.objectAt(i).get('id'),
                    name:data.objectAt(i).get('subject'),
                    number:data.objectAt(i).get('issueNumber'),
                    status:data.objectAt(i).get('status'),
                    projectId:data.objectAt(i).get('projectId')
                };
            }
            Logger.debug(issuesList);
            _self.get('controller').set('issuesList',issuesList);
        });
    },

    /**
     * This function is used to load the User List. This list is used in the
     * message-box to allow users to mention the users in the system
     *
     * @method loadIssues
     * @private
     */
    loadUsers(){
        Logger.debug("AppProjectConversationRoute::loadUsers()");
        let _self = this;
        let module = "user";

        let options = {
            fields: "User.id,User.name",
            sort: "User.name",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        _self.store.query(module,options).then(function(data){
            let usersList = [];
            let usersCount = data.get('length');

            for (let i=0; i<usersCount;i++)
            {
                usersList[i] = {
                    id:data.objectAt(i).get('id'),
                    name:data.objectAt(i).get('name'),
                };
            }
            Logger.debug(usersList);
            _self.get('controller').set('usersList',usersList);
        });

    },

});