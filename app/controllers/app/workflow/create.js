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
     * @protected
     */
    afterSave(workflow) {
        this.router.transitionTo('app.workflow.page', workflow.id);
    }
}
