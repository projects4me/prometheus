/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppProjectIssueCreateController from "prometheus/controllers/app/project/issue/create";
import { htmlSafe } from '@ember/template';

/**
 * This is the controller for issue create page
 *
 * @class AppProjectIssueEditController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends IssueCreateController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssueEditController extends AppProjectIssueCreateController {

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Create
     * @type String
     * @private
     */
    layoutName = 'edit';

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.issue.updated', {
            name: model.get('subject'),
            issueNumber: model.get('issueNumber')
        }));
    }

    /**
     * This function navigates a use to the issue page
     *
     * @method afterCancel
     * @param model
     * @param projectId
     * @protected
     */
    afterCancel(model) {
        this.transitionToRoute('app.project.issue.page', model.get('issueNumber'));
        model.rollbackAttributes();
    }
}
