/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import AppUserCreateController from "prometheus/controllers/app/user/create";
import { htmlSafe } from '@ember/template';

/**
 * The controller for user edit page.
 *
 * @class AppUserCreateController
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends PrometheusCreateController
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserEditController extends AppUserCreateController {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppUserEditController
     * @private
     */
     metadata = {
        sections: [
            {
                name: "userEdit",
                fields: [
                    {
                        name: "name",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "dateOfBirth",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "language",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "timezone",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    }

                ]
            }
        ]
    }

    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.user.updated', {
            name: model.get('name')
        }));
    }

    /**
     * This is a placeholder function that is called after the cancel
     * confirm box has been dismissed in confirmation
     *
     * @method afterCancel
     * @protected
     */
    afterCancel() {
        let userId = this.currentUser.user.id;
        this.router.transitionTo('app.user.page', userId);
    }
}