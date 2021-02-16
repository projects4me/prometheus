/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';

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
     * @property projectId
     * @type String
     * @for TrackedProject
     * @private
     */
    projectId = null;

    /**
     * This function returns projectId
     *
     * @method get
     * @public
     */
    get projectId() {
        return this.projectId;
    }

    /**
     * This function set the property "projectId"
     *
     * @method set
     * @public
     */
    set(projectId) {
        this.projectId = projectId;
    }
}