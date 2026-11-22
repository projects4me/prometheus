/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the workspace Overview: exposes the route's model and deletes an empty workspace after confirmation.
 *
 * @class WorkspaceIndexController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceIndexController extends AppController {
    @service router;
    @service intl;

    queryParams = ['page'];

    /**
     * The page of the Projects box
     *
     * @property page
     * @type Number
     */
    @tracked page = 1;

    /**
     * The number of projects on a page, the same as the route's
     *
     * @property pageSize
     * @type Number
     */
    pageSize = 10;

    /**
     * The offset of the first project on the shown page, for AppUi::Pager
     *
     * @property offset
     * @type Number
     */
    get offset() {
        return (Math.max(1, Number(this.page) || 1) - 1) * this.pageSize;
    }

    /**
     * Shows the page that starts at the offset AppUi::Pager asks for.
     *
     * @method changeOffset
     * @param {Number} offset
     */
    @action
    changeOffset(offset) {
        this.page = Math.floor(offset / this.pageSize) + 1;
    }

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
        return (this.model.workspace?.projectCount ?? 0) > 0;
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
        let workspace = this.model.workspace;
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
