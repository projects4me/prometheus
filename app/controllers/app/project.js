/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import format from "../../utils/data/format";
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
     * These are the users in the system
     *
     * @property issues
     * @type Prometheus.Model.Issue
     * @for Project
     * @public
     */
    issues: {},

    /**
     * This is the list of users that has been extracted
     *
     * @property issuesList
     * @type Ember.computed
     * @returns array
     * @public
     */
    issuesList: computed('projectId', 'issues', function(){
        let map ={
            id:'id',
            name:'subject',
            number:'issueNumber',
            status:'status',
            projectId:'projectId'
        };
        return format.getSelectList(this.get('issues'),map);
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
            this.transitionToRoute('app.project', {project_id:projectId});
        }
    }

});