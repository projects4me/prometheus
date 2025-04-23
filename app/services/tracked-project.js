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
		this.id = projectId;
		sessionStorage.setItem('projectId', projectId);
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
}
