/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The Move project out dialog of a workspace: choose a new workspace or another one, read the warning about work in
 * progress and what changes, confirm. Gaia's refusal is shown and the dialog stays open.
 * The caller passes `@workspace`, `@project`, `@onClose` and `@onMoved` (called after the move, to refresh its tables).
 *
 * @class WorkspaceMoveProjectOutDialogComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkspaceMoveProjectOutDialogComponent extends Component {
    @service workspaceProjects;
    @service intl;

    /**
     * The choices of the select, `{ label, workspace }`, the new workspace (workspace null) first
     *
     * @property options
     * @type Object[]
     */
    @tracked options = [];

    /**
     * The chosen option
     *
     * @property selected
     * @type Object
     */
    @tracked selected = null;

    /**
     * Gaia's refusal or load errors
     *
     * @property errors
     * @type String[]
     */
    @tracked errors = [];

    constructor() {
        super(...arguments);
        let label = this.intl.t('views.app.workspace.moveOut.newWorkspace', { project: this.args.project.name });
        this.options = [{ label, workspace: null }];
        this.selected = this.options[0];
        this.loadTargets();
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
     * Loads the workspaces the project can move to.
     *
     * @method loadTargets
     */
    async loadTargets() {
        try {
            let workspaces = await this.workspaceProjects.moveTargets(this.args.workspace);
            if (!this.gone) {
                this.options = [...this.options, ...workspaces.map((workspace) => ({ label: workspace.name, workspace }))];
            }
        } catch {
            if (!this.gone) {
                this.errors = [this.intl.t('views.app.workspace.moveOut.loadFailed')];
            }
        }
    }

    /**
     * Chooses where the project moves.
     *
     * @method selectTarget
     * @param {Object} option `{ label, workspace }`
     */
    @action
    selectTarget(option) {
        this.selected = option || this.options[0];
        this.errors = [];
    }

    /**
     * Moves the project and asks the caller to refresh.
     *
     * @method move
     * @return {Promise<Boolean>} whether the project moved, which closes the dialog
     */
    @action
    async move() {
        let errors = await this.workspaceProjects.moveOut(this.args.project, this.selected?.workspace || null);
        if (errors.length === 0) {
            if (!this.gone) {
                await this.args.onMoved?.();
            }
            return true;
        }
        if (!this.gone) {
            this.errors = errors;
        }
        return false;
    }
}
