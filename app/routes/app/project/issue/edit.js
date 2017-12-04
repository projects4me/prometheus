/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../../app";

/**
 * The issues edit route
 *
 * @class Edit
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The model for this route
     *
     * @method model
     * @param {Object} params
     * @return Prometheus.Issue
     * @private
     */
    // model:function(params){
    //     Logger.debug('AppProjectIssueEditRoute::model()');
    //     Logger.debug(params);
    //
    //     let options = {
    //         query: '(Issue.issueNumber : '+params.issueNumber+')',
    //         sort : 'Issue.issueNumber',
    //         order: 'ASC',
    //         limit: -1,
    //         //rels: 'none'
    //     };
    //     this.set('breadCrumb',{title:'#'+params.issueNumber,record:true});
    //     Logger.debug('Retrieving issue with options '+options);
    //     let data = this.get('store').query('issue',options);
    //     Logger.debug('-AppProjectIssueEditRoute::model()');
    //     return data;
    // },

    /**
     * This function is called by the route when it has created the controller and
     * the controller is ready to be setup with any data that we may need. We are
     * using this function in order to bind the model of the route to the model
     * of the controller.
     *
     * The setup controller is only called once and if the model is changed Ember
     * reflects the change in the controller as well.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     * @param {Prometheus.Models.Issue} model The model that is created by this route
     * @private
     */
    setupController:function(controller,model){
        Logger.debug('AppProjectIssueEditRoute::setupController');

        let self = this;

        let params = this.paramsFor('app.project.issue.edit');

        let options = {
            query: '(Issue.issueNumber : '+params.issueNumber+')',
            sort : 'Issue.issueNumber',
            order: 'ASC',
            limit: -1,
            //rels: 'none'
        };

        this.set('breadCrumb',{title:'#'+params.issueNumber,record:true});

        Logger.debug('Retrieving issue with options '+options);

        this.get('store').query('issue',options).then(function(data){
            let issue = data.nextObject(0);
            Logger.debug(issue.get('startDate'));
            let startDate = moment(issue.get('startDate'),['YYYY-MM-DD','MMMM D, YYYY']).format('MMMM D, YYYY');
            let endDate = moment(issue.get('endDate'),['YYYY-MM-DD','MMMM D, YYYY']).format('MMMM D, YYYY');
            issue.set('startDate',startDate);
            issue.set('endDate',endDate);

            Logger.debug('==================');
            Logger.debug(issue);
            Logger.debug(startDate);
            Logger.debug(endDate);

            controller.set('model',issue);
            self.loadRelated(controller);
        });

        Logger.debug('-AppProjectIssueEditRoute::setupController');
    },

    /**
     * This function is used to load the project related data e.g. project issue
     * types, etc.
     *
     * @method loadRelated
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issue edit page
     * @private
     */
    loadRelated:function(controller){

        let i18n = this.get('i18n');

        let projectId = this.paramsFor('app.project').projectId;

        let options = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes',
            sort: "members.name",
            limit: -1
        };

        this.store.query('project',options).then(function(data){

            let memberCount = data.nextObject(0).get('members.length');
            let memberList = [];
            let temp = null;
            memberList[0] = {label:i18n.t("global.blank"), value:null};
            for (let i=1;i<=memberCount;i++)
            {
                temp = data.nextObject(0).get('members').nextObject(i-1);
                memberList[i] = {label:temp.get('name'), value:temp.get('id')};
            }

            let milestoneCount = data.nextObject(0).get('milestones.length');
            let milestoneList = [];
            temp = null;
            milestoneList[0] = {label:i18n.t("global.blank"), value:null};
            for (let i=1;i<=milestoneCount;i++)
            {
                temp = data.nextObject(0).get('milestones').nextObject(i-1);
                milestoneList[i] = {label:temp.get('name'), value:temp.get('id')};
            }

            let typeCount = data.nextObject(0).get('issuetypes.length');
            let typeList = [];
            temp = null;
            for (let i=0;i<typeCount;i++)
            {
                temp = data.nextObject(0).get('issuetypes').nextObject(i);
                typeList[i] = {label:temp.get('name'), value:temp.get('id')};
            }

            let priority = [
                {
                    "label":"Medium",
                    "value":"medium"
                },
                {
                    "label":"High",
                    "value":"high"
                },
                {
                    "label":"Low",
                    "value":"low"
                },
                {
                    "label":"Critical",
                    "value":"critical"
                },
                {
                    "label":"Bloker",
                    "value":"blocker"
                }
            ];

            let status = [
                {
                    "label":"New",
                    "value":"new"
                },
                {
                    "label":"In Progress",
                    "value":"in_progress"
                },
                {
                    "label":"Pending",
                    "value":"pending"
                },
                {
                    "label":"Done",
                    "value":"done"
                },
                {
                    "label":"Wont't Fix",
                    "value":"wont_fix"
                }
            ];


            Logger.debug('Data to be given');
            Logger.debug(memberList);
            Logger.debug(milestoneList);
            Logger.debug(typeList);
            controller.set('memberList',memberList);
            controller.set('milestoneList',milestoneList);
            controller.set('type',typeList);
            controller.set('status',status);
            controller.set('priority',priority);

        });

    },
});