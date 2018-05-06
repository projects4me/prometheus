/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import IssueCreate from "prometheus/controllers/app/project/issue/create";

/**
 * This is the controller for issue create page
 *
 * @class Edit
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default IssueCreate.extend({

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Create
     * @type String
     * @private
     */
    layoutName:'edit',

    /**
     * This function sets the model properties before saving it
     *
     * @method beforeSave
     * @param model
     * @protected
     */
    beforeSave(model){
        model.set('projectId', this.target.currentState.routerJs.state.params["app.project"].project_id);
    },

    /**
     * This function navigates a use to the issue page
     *
     * @method afterCancel
     * @param model
     * @param projectId
     * @protected
     */
    afterCancel(model){
        let projectId = this.target.currentState.routerJs.state.params["app.project"].project_id;
        this.transitionToRoute('app.project.issue.page', {
            project_id:projectId,
            issue_number:model.get('issueNumber')
        });
        model.rollbackAttributes();
    }
});
