/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import { tracked } from "@glimmer/tracking";
import { htmlSafe } from '@ember/template';

/**
 * The controller for user create page.
 *
 * @class AppUserCreateController
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppUserCreateController extends PrometheusCreateController {

    /**
     * This is the module for which we are trying to create.
     *
     * @property module
     * @type String
     * @for AppUserCreateController
     * @protected
     */
    module = 'user';

    /**
     * The language selected by user.
     *
     * @property selectedLanguage
     * @for AppUserCreateController
     * @type String
     * @protected
     */
    @tracked selectedLanguage = null;

    /**
     * The list of language that will be used to show a dropdown of different languages.
     *
     * @property languagesList
     * @for AppUserCreateController
     * @type Array
     * @protected
     */
    languagesList = [
        {
            label: "English",
            value: "en"
        },
        {
            label: "German",
            value: "de"
        },
        {
            label: "Chinese",
            value: "zh"
        },
        {
            label: "Dutch",
            value: "dl"
        },
        {
            label: "French",
            value: "fr"
        },
        {
            label: "Urdu",
            value: "ur"
        }
    ]

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.user.created', {
            name: model.get('name')
        }));
    }

    /**
     * This function navigate to user's profile page.
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        this.router.transitionTo('app.user.page', model.get('id'));
    }
}
