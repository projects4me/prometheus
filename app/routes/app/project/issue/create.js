/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "../../../app";

/**
 *  This is the route that will handle the creation of new issues
 *
 *  @class Create
 *  @namespace Prometheus.Routes
 *  @module App.Project.Issue
 *  @extends App
 *  @author Hammad Hassan <gollomer@gamil.com>
 */
export default App.extend({

    /**
     * This is the model for this route
     *
     * @property model
     * @type function
     * @for Create
     * @protected
     */
    model:function()
    {
        return this.get('store').createRecord('issue');
    },


    /**
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @protected
     */
    setupController:function(controller,model)
    {

        Logger.debug('AppProjectIndexRoute::setupController');

        let i18n = this.get('i18n');

        // If the user navigated directly to the wiki project or page then lets setup the project id
        let projectId = this.paramsFor('app.project').projectId;

        Logger.debug(projectId);

        let options = {
            query: "(Project.id : "+projectId+")",
            rels : 'members,milestones,issuetypes',
            sort: "members.name",
            limit: -1
        };

        Logger.debug('Retreiving the project with options ');
        Logger.debug(options);

        this.data = this.store.query('project',options).then(function(data){

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

        controller.set('model',model);
        Logger.debug('Model');
        Logger.debug(model);
    },

});
