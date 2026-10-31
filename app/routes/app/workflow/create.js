/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* global Logger */
import PageRoute from './page';
import WorkflowGraph from 'prometheus/utils/workflow/graph';

/**
 * The editor of a new workflow, a Draft with an empty graph; it shares the page template
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Workflow
 * @extends Page
 */
export default class AppWorkflowCreateRoute extends PageRoute {
    /**
     * @property templateName
     * @type String
     * @public
     */
    templateName = 'app/workflow/page';

    /**
     * A new workflow with an empty graph
     *
     * @method model
     * @returns {Promise}
     */
    async model() {
        Logger.debug('AppWorkflowCreateRoute::model');
        try {
            let projects = await this.loadProjects();
            let workflow = this.store.createRecord('workflow', { status: 'Draft' });
            return { workflow, graph: new WorkflowGraph(), projects };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }
    }

    /**
     * Starts the editor of the new workflow with no node selected
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model
     * @private
     */
    setupController(controller, model) {
        controller.model = model;
        controller.selectedNode = null;
    }

    /**
     * Drops the workflow when the user leaves without saving it
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        let workflow = controller.model?.workflow;
        if (isExiting && workflow?.isNew && !workflow.isSaving) {
            workflow.unloadRecord();
        }
    }
}
