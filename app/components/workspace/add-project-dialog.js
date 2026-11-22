/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The Add project dialog of a workspace: pick a project, read who is shared both ways and where it runs, confirm.
 * The caller opens it with `{{#if}}` and passes `@workspace`, `@onClose` and `@onAdded` (called after the project
 * joined, to refresh its tables).
 *
 * @class WorkspaceAddProjectDialogComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkspaceAddProjectDialogComponent extends Component {
    @service workspaceProjects;
    @service intl;

    /**
     * The projects that can be chosen, as `{ label, project }`
     *
     * @property options
     * @type Object[]
     */
    @tracked options = [];

    /**
     * The chosen project
     *
     * @property project
     * @type Project
     */
    @tracked project = null;

    /**
     * The chosen option of the select, `{ label, project }`
     *
     * @property selected
     * @type Object
     */
    @tracked selected = null;

    /**
     * Whether the chosen project is alone in its workspace
     *
     * @property alone
     * @type Boolean
     */
    @tracked alone = false;

    /**
     * Who is added to the joining project (`toProject`) and to the others (`toOthers`)
     *
     * @property sharing
     * @type Object
     */
    @tracked sharing = { toProject: [], toOthers: [] };

    /**
     * The repository name of the chosen project
     *
     * @property repository
     * @type String
     */
    @tracked repository = '';

    /**
     * Gaia's refusal or load errors
     *
     * @property errors
     * @type String[]
     */
    @tracked errors = [];

    constructor() {
        super(...arguments);
        this.loadOptions();
    }

    /**
     * Whether the component is torn down
     *
     * @property gone
     * @type Boolean
     */
    get gone() {
        return isDestroying(this) || isDestroyed(this);
    }

    /**
     * Loads the projects that can join.
     *
     * @method loadOptions
     */
    async loadOptions() {
        try {
            let options = await this.workspaceProjects.candidates(this.args.workspace);
            if (!this.gone) {
                this.options = options.map((project) => ({ label: project.name, project }));
            }
        } catch {
            if (!this.gone) {
                this.errors = [this.intl.t('views.app.workspace.addProject.loadFailed')];
            }
        }
    }

    /**
     * Chooses a project and loads what the dialog shows about it.
     *
     * @method selectProject
     * @param {Object} option `{ label, project }`, null when cleared
     */
    @action
    async selectProject(option) {
        let project = option?.project || null;
        this.selected = option;
        this.project = project;
        this.errors = [];
        this.alone = false;
        this.sharing = { toProject: [], toOthers: [] };
        this.repository = '';
        if (!project) {
            return;
        }
        try {
            let [alone, sharing, repository] = await Promise.all([
                this.workspaceProjects.isAloneInWorkspace(project),
                this.workspaceProjects.sharing(this.args.workspace, project),
                this.workspaceProjects.repositoryName(project)
            ]);
            if (this.gone || this.project !== project) {
                return;
            }
            this.alone = alone;
            this.sharing = sharing;
            this.repository = repository;
        } catch {
            if (!this.gone && this.project === project) {
                this.errors = [this.intl.t('views.app.workspace.addProject.loadFailed')];
            }
        }
    }

    /**
     * Moves the chosen project into the workspace and asks the caller to refresh.
     *
     * @method add
     * @return {Promise<Boolean>} whether the project joined, which closes the dialog
     */
    @action
    async add() {
        if (!this.project) {
            return false;
        }
        let errors = await this.workspaceProjects.join(this.args.workspace, this.project);
        if (errors.length === 0) {
            await this.args.onAdded?.();
            return true;
        }
        if (!this.gone) {
            this.errors = errors;
        }
        return false;
    }
}
