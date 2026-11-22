/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the Environment tab of the workspace Settings, it only reads.
 *
 * @class WorkspaceSettingsEnvironmentController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceSettingsEnvironmentController extends AppController {
    @service intl;

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
