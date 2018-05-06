/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app/projects/create";
import format from "prometheus/utils/data/format";

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
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @protected
     */
    setupController:function(controller)
    {
        Logger.debug('AppProjectIndexRoute::setupController');
        let _self = this;

        let params = this.paramsFor('app.projects.edit');
        let options = {
            query: '(Project.id : '+params.project_id+')',
            rels: 'none'
        };

        this.get('store').query('project',options).then(function(data){
            let project = data.objectAt(0);
            controller.set('model',project);
        });

        let type = format.getList('views.app.project.lists.type',_self.get('i18n.locale'));
        let status = format.getList('views.app.project.lists.status',_self.get('i18n.locale'));

        controller.set('status',status);
        controller.set('type',type);
    },

});
