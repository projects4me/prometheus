/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppProjectsCreateController from "prometheus/controllers/app/projects/create";
import _ from "lodash";

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class AppProjectsEditController
 * @namespace Prometheus.Controllers
 * @module App.Projects
 * @extends Create
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectsEditController extends AppProjectsCreateController {

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Edit
     * @type String
     * @private
     */
    layoutName = 'edit';

    /**
     * This function sets the short code for the project.
     *
     * @method beforeValidate
     * @param model
     * @protected
     */
    beforeValidate(model) {
        model.set('shortCode', this.shortCode);
    }

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 0);
    }

    /**
     * This function navigates the user to the project page
     *
     * @method afterCancel
     * @param model
     * @param projectId
     * @protected
     */
    afterCancel(model) {
        this.transitionToRoute('app.project', {
            shortcode: model.shortCode,
        });
        model.rollbackAttributes();
    }
}
