/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app/projects/create";
import Format from "prometheus/utils/data/format";

/**
 *  This is the route that will handle the edit of a project
 *
 *  @class Edit
 *  @namespace Prometheus.Routes
 *  @module App.Projects
 *  @extends App
 *  @author Hammad Hassan <gollomer@gamil.com>
 */
export default App.extend({

    /**
     * This is the template that we want to display for this the Edit view
     *
     * @property templateName
     * @for Edit
     * @type String
     * @public
     */
    templateName: 'app/projects/create',

    /**
     * The model for this route
     *
     * @method model
     * @param params
     * @private
     */
    model(params) {
        let _self = this;
        let projectId = _self.trackedProject.getProjectId();

        let projectOptions = {
            query: '(Project.id : ' + projectId + ')',
        };
        return this.store.query('project', projectOptions)
            .catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: 'project'
                });
            });
    },

    /**
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @protected
     */
    setupController: function (controller, model) {
        Logger.debug('AppProjectIndexRoute::setupController');

        let format = new Format(this);
        let type = format.getList('views.app.project.lists.type');
        let status = format.getList('views.app.project.lists.status');

        controller.set('status', status);
        controller.set('type', type);
        controller.set('model', model.objectAt(0));
    },

});
