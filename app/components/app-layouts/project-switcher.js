/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../app';
import { action } from '@ember/object';
import { service } from '@ember/service';
import format from 'prometheus/utils/data/format';

/**
 * The header project switcher. It shows the loaded project and lets the user pick another one.
 *
 * @class ProjectSwitcher
 * @namespace Prometheus.Components
 * @extends AppComponent
 */
export default class ProjectSwitcherComponent extends AppComponent {

    /**
     * The trackedProject service provides the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for ProjectSwitcher
     * @private
     */
    @service trackedProject;

    /**
     * The router service is used to move to the chosen project.
     *
     * @property router
     * @type Ember.Service
     * @for ProjectSwitcher
     * @private
     */
    @service router;

    /**
     * The options of the select: name, short code and id of each project of the user.
     *
     * @property options
     * @type Array
     * @for ProjectSwitcher
     * @public
     */
    get options() {
        if (!this.args.projects) {
            return [];
        }
        return (new format(this)).getSelectList(this.args.projects, { label: 'name', value: 'id', code: 'shortCode' });
    }

    /**
     * The option of the loaded project, if any.
     *
     * @property selected
     * @type Object
     * @for ProjectSwitcher
     * @public
     */
    get selected() {
        return this.options.find((option) => option.value === this.trackedProject.id) ?? null;
    }

    /**
     * This function is called when a project is selected
     *
     * @method projectChanged
     * @param {Object} project The selected option
     * @public
     */
    @action projectChanged(project) {
        this.trackedProject.setProjectId(project.value);
        let selectedProject = this.trackedProject.getProject();
        let lastSelectedProject = this.trackedProject.lastSelectedProject;
        if (selectedProject.shortCode !== undefined) {
            let url = this.getTransitionUrl(selectedProject, lastSelectedProject);
            this.router.transitionTo(url);
        }
    }

    /**
     * This function is used to get the url when a project is changed
     *
     * @method getTransitionUrl
     * @param {Object} selectedProject The selected project
     * @param {Object} lastSelectedProject The last selected project
     * @return {String} The url to transition to
     */
    getTransitionUrl(selectedProject, lastSelectedProject) {
        let notAllowedTransitions = ['app.project.index', 'app.project.issue.page', 'app.project.wiki.page'];
        if (notAllowedTransitions.includes(this.router.currentRouteName)) {
            return `/app/project/${selectedProject.shortCode.toLowerCase()}`;
        }
        let currentUrl = this.router.currentURL;
        if (lastSelectedProject && currentUrl.includes(lastSelectedProject.shortCode.toLowerCase())) {
            let url = currentUrl.replace(lastSelectedProject.shortCode.toLowerCase(), selectedProject.shortCode.toLowerCase());
            if (url.includes('?')) {
                url = url.split('?')[0];
            }
            return url;
        } else {
            return `/app/project/${selectedProject.shortCode.toLowerCase()}`;
        }
    }
}
