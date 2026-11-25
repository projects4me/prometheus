/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the Environment tab of the workspace Settings: binds and unbinds the runtime, the repositories are read only.
 *
 * @class WorkspaceSettingsEnvironmentController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceSettingsEnvironmentController extends AppController {
    @service intl;
    @service acl;

    /**
     * The runtimes (service clients of kind runtime) the picker lists, set by the route
     *
     * @property runtimes
     * @type Serviceclient[]
     */
    @tracked runtimes = [];

    /**
     * The id of the runtime chosen in the picker
     *
     * @property selectedRuntimeId
     * @type String
     */
    @tracked selectedRuntimeId = null;

    /**
     * Gaia's refusal messages of the last save
     *
     * @property runtimeErrors
     * @type String[]
     */
    @tracked runtimeErrors = [];

    /**
     * Whether a save is running
     *
     * @property saving
     * @type Boolean
     */
    @tracked saving = false;

    /**
     * The options of the runtime picker
     *
     * @property runtimeOptions
     * @type Object[]
     */
    get runtimeOptions() {
        return this.runtimes.map((runtime) => ({ label: runtime.name, value: String(runtime.id) }));
    }

    /**
     * The picked option
     *
     * @property selectedRuntime
     * @type Object
     */
    get selectedRuntime() {
        return this.runtimeOptions.find((option) => option.value === String(this.selectedRuntimeId)) || null;
    }

    /**
     * Whether the user may change the binding: workspace.update and the right to read the service clients to pick from
     *
     * @property canBind
     * @type Boolean
     */
    get canBind() {
        return this.acl.checkAccess('workspace.update') && this.acl.checkAccess('serviceclient.read');
    }

    /**
     * Whether the workspace is bound to a runtime
     *
     * @property isBound
     * @type Boolean
     */
    get isBound() {
        return Boolean(this.boundRuntimeId);
    }

    /**
     * The id of the bound runtime, from the attribute or the relationship
     *
     * @property boundRuntimeId
     * @type String|null
     */
    get boundRuntimeId() {
        return this.model?.runtimeId || this.model?.belongsTo('runtime').id() || null;
    }

    /**
     * Whether Save is disabled: nothing picked, the pick is already bound, or a save is running
     *
     * @property saveDisabled
     * @type Boolean
     */
    get saveDisabled() {
        return this.saving || !this.selectedRuntimeId || String(this.selectedRuntimeId) === String(this.boundRuntimeId);
    }

    /**
     * Remembers the runtime picked in the picker
     *
     * @method selectRuntime
     * @param {Object} option `{ label, value }`, null when cleared
     */
    @action
    selectRuntime(option) {
        this.selectedRuntimeId = option?.value ?? null;
    }

    /**
     * Binds the workspace to the picked runtime.
     *
     * @method bind
     * @return {Promise}
     */
    @action
    bind() {
        return this.saveRuntime(this.selectedRuntimeId);
    }

    /**
     * Unbinds the runtime from the workspace.
     *
     * @method unbind
     * @return {Promise}
     */
    @action
    unbind() {
        return this.saveRuntime(null);
    }

    /**
     * PATCHes `runtimeId` of the workspace. Gaia validates it; a refusal restores the workspace and shows Gaia's
     * messages.
     *
     * @method saveRuntime
     * @param {String|null} runtimeId
     * @return {Promise}
     * @private
     */
    async saveRuntime(runtimeId) {
        if (this.saving) {
            return;
        }
        this.saving = true;
        this.runtimeErrors = [];
        let workspace = this.model;
        try {
            workspace.runtimeId = runtimeId ? String(runtimeId) : null;
            await workspace.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.selectedRuntimeId = runtimeId;
        } catch (error) {
            workspace.rollbackAttributes();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
            this.runtimeErrors = messages.length ? messages : [this.intl.t('views.app.workspace.settings.environment.bindFailed')];
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.saving = false;
            }
        }
    }

    /**
     * The repositories of the workspace, set by the route
     *
     * @property repositories
     * @type Repository[]
     */
    @tracked repositories = [];

    /**
     * The project names by project id, set by the route
     *
     * @property projectNames
     * @type Object
     */
    @tracked projectNames = {};

    /**
     * The repositories as table rows, each with the name of its project or "Workspace" when it has none
     *
     * @property rows
     * @type Object[]
     */
    get rows() {
        let fallback = this.intl.t('views.app.workspace.settings.environment.workspace');
        return this.repositories.map((repository) => ({
            id: repository.id,
            name: repository.name,
            url: repository.url,
            baseBranch: repository.baseBranch,
            project: (repository.projectId && this.projectNames[repository.projectId]) || fallback
        }));
    }

    /**
     * The name of the runtime the workspace is bound to, empty when it has none
     *
     * @property runtimeName
     * @type String
     */
    get runtimeName() {
        return this.model?.runtime?.get('name') || '';
    }

    /**
     * The kind (client) of the runtime the workspace is bound to
     *
     * @property runtimeKind
     * @type String
     */
    get runtimeKind() {
        return this.model?.runtime?.get('kind') || '';
    }

    /**
     * The columns of the Repositories table
     *
     * @property columns
     * @type Array
     */
    get columns() {
        let t = (key) => this.intl.t(`views.app.workspace.settings.environment.${key}`);
        return [
            { key: 'name', label: t('name') },
            { key: 'url', label: t('url') },
            { key: 'baseBranch', label: t('baseBranch') },
            { key: 'project', label: t('project') }
        ];
    }
}
