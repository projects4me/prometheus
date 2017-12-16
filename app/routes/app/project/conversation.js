/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from '../../app';

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

        var self = this;
        var params = this.paramsFor('app.project');

        // Get the parameters for the current route every time as they might change from one record to another
        //var params = this.paramsFor('app.conversations');

        // Set the data in the current instance of the object, this is required. Unless this is done the route will display the same data every time
        //this.module = Ember.String.capitalize(this.module);

        //self.loadIssues(params.projectId);
        //self.loadUsers();
        //var metaData = MD.create();
        var i18n = this.get('i18n');
        controller.set('i18n',i18n);
        controller.set('projectId',params.projectId);

        //this.metaData = MD.create().getViewMeta(this.module,'list',i18n);
        var options = {
            //limit: ENV.app.list.pagelimit
            limit:-1,
            page: 0
        };

        if (params.query !== undefined && params.query !== '' &&  params.query !== null) {
            options.query = params.query;
        }

        options.order = 'DESC';
        options.sort = 'comments.dateModified, Conversationroom.dateModified';
        options.query = "(Conversationroom.projectId : "+params.projectId+")";
        this.store.query(this.module,options).then(function(data){
            controller.set('model',data.toArray());
        });


        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('module',this.module);
        //controller.set('metaData',this.metaData);
        //controller.setupController();
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
        Logger.debug("AppProjectConversationRoute::loadIssues("+projectId+")");
        var self = this;
        var module = "issue";

        var options = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.status,Issue.projectId",
            query: "(Issue.projectId : "+projectId+")",
            rels: "none",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        this.store.query(module,options).then(function(data){
            var issuesList = [];
            var issuesCount = data.get('length');

            for (var i=0; i<issuesCount;i++)
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
    },

    /**
     * This function is used to load the User List. This list is used in the
     * message-box to allow users to mention the users in the system
     *
     * @method loadIssues
     * @private
     */
    loadUsers:function(){
        Logger.debug("AppProjectConversationRoute::loadUsers()");
        var self = this;
        var module = "user";

        var options = {
            fields: "User.id,User.name",
            rels: "none",
            sort: "User.name",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        this.store.query(module,options).then(function(data){
            var usersList = [];
            var usersCount = data.get('length');

            for (var i=0; i<usersCount;i++)
            {
                usersList[i] = {
                    id:data.nextObject(i).get('id'),
                    name:data.nextObject(i).get('name'),
                };
            }
            Logger.debug(usersList);
            self.get('controller').set('usersList',usersList);
        });

    },

});