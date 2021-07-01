/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import format from "prometheus/utils/data/format";
import { computed } from '@ember/object';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class Project
 * @namespace Prometheus.Controllers
 * @module App
 * @extends Prometheus
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Prometheus.extend({

    /**
     * These are the issues for the current project
     *
     * @property issues
     * @type Prometheus.Model.Issue
     * @for Project
     * @public
     */
    issues: {},

    /**
     * These are the members for the current project
     *
     * @property members
     * @type Prometheus.Model.User
     * @for Project
     * @public
     */
    members: {},

    /**
     * This is the list of users that has been extracted
     *
     * @property issuesList
     * @type Ember.computed
     * @returns array
     * @public
     */
    issuesList: computed('projectId', 'issues', function(){
        let map = {
            id:'id',
            name:'subject',
            number:'issueNumber',
            status:'status',
            projectId:'projectId'
        };
        let issueList = format.getSelectList(this.issues, map);
        issueList.unshift({
            id:'',
            name:this.i18n.t('global.blank'),
            number:'',
            status:'',
            projectId:''
        });
        return issueList;
    }),

    /**
     * This is the list of users that has been extracted
     *
     * @property membersList
     * @type Ember.computed
     * @returns array
     * @public
     */
    membersList: computed('projectId', 'members', function(){
        return format.getSelectList(this.members);
    }),

    /**
     * These are the actions supported by this controller
     *
     * @property actions
     * @type Object
     * @for Project
     * @public
     */
    actions:{

        /**
         * This function navigates a user to the project page
         *
         * @method navigateToProject
         * @public
         */
        navigateToProject(projectId){
            alert(projectId);
            this.transitionToRoute('app.project', {project_id:projectId});
        }
    }

});