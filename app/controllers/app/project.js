/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import format from "prometheus/utils/data/format";
import { computed, action } from '@ember/object';
import { htmlSafe } from '@ember/template';

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class Project
 * @namespace Prometheus.Controllers
 * @module App
 * @extends Prometheus
 * @author Hammad Hassan <gollmer@gmail.com>
 */
export default class AppProjectController extends PrometheusController {

    /**
     * These are the issues for the current project
     *
     * @property issues
     * @type Prometheus.Model.Issue
     * @for Project
     * @public
     */
    issues = {};

    /**
     * These are the members for the current project
     *
     * @property members
     * @type Prometheus.Model.User
     * @for Project
     * @public
     */
    members = {};

    /**
     * This is the list of users that has been extracted
     *
     * @property issuesList
     * @type Ember.computed
     * @returns array
     * @public
     */
    @computed('projectId', 'issues')
    get issuesList() {
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            projectId: 'projectId'
        };
        let issueList = (new format(this)).getSelectList(this.issues, map);
        issueList.unshift({
            id: '',
            name: htmlSafe(this.intl.t('global.blank')).toHTML(),
            number: '',
            status: '',
            projectId: ''
        });
        return issueList;
    }

    /**
     * This is the list of users that has been extracted
     *
     * @property membersList
     * @type Ember.computed
     * @returns array
     * @public
     */
    @computed('projectId', 'members')
    get membersList() {
        return (new format(this)).getSelectList(this.members);
    }
}