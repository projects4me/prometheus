/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import format from "../../utils/data/format";
import Controller from '@ember/controller';
import { computed } from '@ember/object';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class Project
 * @namespace Prometheus.Controller.App
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Controller.extend({

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
    })

});