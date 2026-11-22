/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the Delete tab of the workspace Settings: deletes an empty workspace after confirmation.
 *
 * @class WorkspaceSettingsDeleteController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceSettingsDeleteController extends AppController {
    @service router;
    @service intl;

    /**
     * Whether the delete confirmation is open
     *
     * @property confirmingDelete
     * @type Boolean
     */
    @tracked confirmingDelete = false;

    /**
     * The messages of Gaia's refusal to delete the workspace, empty when there is none
     *
     * @property deleteErrors
     * @type String[]
     */
    @tracked deleteErrors = [];

    /**
     * Whether the workspace has projects, which blocks deleting it
     *
     * @property hasProjects
     * @type Boolean
     */
    get hasProjects() {
        return (this.model?.projectCount ?? 0) > 0;
    }

    /**
     * Opens the delete confirmation
     *
     * @method openDelete
     */
    @action
    openDelete() {
        if (this.hasProjects) {
            return;
        }
        this.deleteErrors = [];
        this.confirmingDelete = true;
    }

    /**
     * Closes the delete confirmation
     *
     * @method closeDelete
     */
    @action
    closeDelete() {
        this.confirmingDelete = false;
    }

    /**
     * Deletes the workspace and goes to the workspaces list. When Gaia refuses, its messages are shown in the
     * confirmation, which stays open.
     *
     * @method deleteWorkspace
     * @return {Promise<Boolean>} whether it was deleted, which closes the confirmation
     */
    @action
    async deleteWorkspace() {
        let workspace = this.model;
        try {
            await workspace.destroyRecord();
        } catch (error) {
            workspace.rollbackAttributes();
            if (isDestroying(this) || isDestroyed(this)) {
                return false;
            }
            let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
            this.deleteErrors = messages.length ? messages : [this.intl.t('views.app.workspace.delete.failed')];
            return false;
        }
        if (isDestroying(this) || isDestroyed(this)) {
            return true;
        }
        this.confirmingDelete = false;
        this.router.transitionTo('app.workspaces');
        return true;
    }
}
