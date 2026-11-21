/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

/**
 * This is a service that provides id of selected project. This service can be injected
 * anywhere in the application
 *
 * @class TrackedProject
 * @namespace Prometheus.Services
 * @extends Service
 * @author Hammad Hassan <gollomer@gmail.com>
 */

export default class TrackedProjectService extends Service {
	/**
	 * Id of selected project
	 *
	 * @property id
	 * @type String
	 * @for TrackedProject
	 * @public
	 */
	@tracked id = this.getProjectId();

	/**
	 * The last selected project
	 *
	 * @property lastSelectedProject
	 * @type Object
	 * @for TrackedProject
	 * @public
	 */
	@tracked lastSelectedProject = null;

	/**
	 * The workspace of the selected project, once loaded by loadWorkspace.
	 *
	 * @property workspace
	 * @type Object
	 * @for TrackedProject
	 * @public
	 */
	@tracked workspace = null;

	/**
	 * The workspace load in flight: the workspace id and its promise, so a second call for the same workspace
	 * waits for the first instead of fetching again.
	 *
	 * @property _workspaceLoad
	 * @type Object
	 * @for TrackedProject
	 * @private
	 */
	_workspaceLoad = null;

	/**
	 * The store service.
	 *
	 * @property store
	 * @type Ember.Service
	 * @for TrackedProject
	 * @public
	 */
	@service store;

	/**
	 * This function returns projectId
	 *
	 * @method get
	 * @public
	 */
	getProjectId() {
		return sessionStorage.getItem('projectId') || null;
	}

	/**
	 * This function set the property "id" and also set the projectId in session storage.
	 *
	 * @method setProjectId
	 * @param {String} projectId The project id
	 * @public
	 */
	setProjectId(projectId) {
		this.lastSelectedProject = this.getProject();
		this.id = projectId;
		sessionStorage.setItem('projectId', projectId);
		this.loadWorkspace();
	}

	/**
	 * Loads the workspace of the selected project (project.workspaceId) into the workspace property. It peeks the
	 * store first and fetches the record only when it is not there. A response that arrives after the project
	 * changed again is dropped.
	 *
	 * @method loadWorkspace
	 * @return {Promise}
	 * @public
	 */
	loadWorkspace() {
		let workspaceId = this.getProject()?.workspaceId;
		if (!workspaceId) {
			this.workspace = null;
			return Promise.resolve();
		}
		if (this.workspace?.id === workspaceId) {
			return Promise.resolve();
		}
		if (this._workspaceLoad?.workspaceId === workspaceId) {
			return this._workspaceLoad.promise;
		}
		let promise = this._fetchWorkspace(workspaceId).then((workspace) => {
			if (this._workspaceLoad?.promise === promise) {
				this._workspaceLoad = null;
			}
			if (this.getProject()?.workspaceId === workspaceId) {
				this.workspace = workspace;
			}
		});
		this._workspaceLoad = { workspaceId, promise };
		return promise;
	}

	/**
	 * Returns the workspace record from the store, fetching it when it is not loaded; null when it can't be read.
	 *
	 * @method _fetchWorkspace
	 * @param {String} workspaceId
	 * @return {Promise}
	 * @private
	 */
	async _fetchWorkspace(workspaceId) {
		let workspace = this.store.peekRecord('workspace', workspaceId);
		if (workspace) {
			return workspace;
		}
		try {
			return await this.store.findRecord('workspace', workspaceId);
		} catch {
			return null;
		}
	}

	/**
	 * This function returns the project model by peeking the record from the store.
	 *
	 * @method getProject
	 * @public
	 */
	getProject() {
		if (this.id) {
			return this.store.peekRecord('project', this.id);
		}
	}

	/**
	 * This property is used to get the short code of the project.
	 *
	 * @property shortCode
	 * @type String
	 * @public
	 */
	get shortCode() {
		return this.getProject()?.shortCode?.toLowerCase();
	}

	/**
	 * This property is used to get the short code of the selected project's workspace.
	 *
	 * @property workspaceShortCode
	 * @type String
	 * @public
	 */
	get workspaceShortCode() {
		return this.workspace?.shortCode?.toLowerCase();
	}
}
