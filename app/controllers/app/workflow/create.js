/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PageController from './page';

/**
 * The editor of a new workflow; once saved, the editor moves to the workflow's page
 *
 * @class AppWorkflowCreateController
 * @namespace Prometheus.Controllers
 * @extends AppWorkflowPageController
 */
export default class AppWorkflowCreateController extends PageController {
    /**
     * @method afterSave
     * @param {Prometheus.Models.Workflow} workflow
     * @param {Number} problems the steps and connections that could not be saved; the editor stays open so
     * the marked ones can be fixed
     * @protected
     */
    afterSave(workflow, problems) {
        if (!problems) {
            this.router.transitionTo('app.workflow.page', workflow.id);
        }
    }
}
