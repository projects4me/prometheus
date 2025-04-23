/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { inject as controller } from "@ember/controller";
import { computed, action } from "@ember/object";
import { hash } from "rsvp";
import _ from "lodash";
import { tracked } from "@glimmer/tracking";

/**
 * This is the controller for issue create page
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class PrometheusCreateController extends PrometheusController {
    /**
     * This contains all of the validation messages of each field.
     *
     * @property message
     * @type Object
     * @for PrometheusCreateController
     * @protected
     */
    @tracked message = {};

    /**
     * This is the layout name that is used to figure out what to
     * display
     *
     * @property layoutName
     * @for Create
     * @type String
     * @private
     */
    @tracked layoutName = "create";

    /**
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module = "";

    /**
     * This flag is used to show the field information.
     * 
     * @property showFieldInfo
     * @type Boolean
     * @for Create
     */
    showFieldInfo = false;

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    @controller("app") appController;

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    @computed("appController.usersList")
    get usersList() {
        return this.appController.get("usersList");
    }

    /**
     * This function is responsible for saving the model.
     * After successfully saving the function takes the user to
     * the saved page.
     *
     * @method save
     * @param {string} schemaName The schema name for which we are saving the model.
     * @param {string} module The module for which we are showing the error. This can be multiple modules in same view/template.
     * @public
     * @todo Handle the situation where we are not using validations
     */
    @action save(schemaName, module) {
        let model = this.model;

        const promise = new Promise((resolve, reject) => {
            this.validate(model, schemaName).then((validation) => {
                if (validation.isValid) {
                    this.beforeSave(model);
                    this._save(model, resolve, reject);
                } else {
                    this._showError(validation.errors, module);
                    reject();
                }
            });
        });
        return promise;
    }

    /**
     * This function is used to validate a field of the given schema.
     *
     * @method validateField
     * @param {String} schemaName
     * @param {Object} field
     * @param {Event} event
     * @protected
     */
    @action validateField(schemaName, field, event) {
        //use model if passed otherwise use default "this.model"
        let model = field.model ?? this.model;

        //Validate field if it exists on schema object
        if (this[schemaName].fields[field.name]) {
            try {
                this.beforeValidate(model);
                this[schemaName].validateSyncAt(field.name, model);

                //If validation is passed then remove previous message of field (if exists)
                _.set(this.message, `${schemaName}.${field.name}`, "");
                this.message = { ...this.message };

            } catch (e) {
                this.setValidationMessages(
                    e,
                    schemaName,
                    field
                );
            }
        }
    }

    /**
     * This function is used to set validation messages against each field.
     *
     * @method setValidationMessages
     * @param {Error} error
     * @param {String} schemaName
     * @param {Object} field
     * @protected
     */
    setValidationMessages(error, schemaName, field) {
        let fieldName = (error.params.path) ? error.params.path : field.name;
        let defaultErrorTypes = ['required', 'optionality'];
        if (defaultErrorTypes.includes(error.type)) {
            _.set(
                this.message,
                `${schemaName}.${fieldName}`,
                this.intl.t(`errors.${error.type}`)
            );
        } else {
            _.set(
                this.message,
                `${schemaName}.${fieldName}`,
                error.errors[0]
            );

        }

        this.message = { ...this.message };
    }

    /**
     * This function lets a user traverse to the issue list view of the project
     *
     * @method cancel
     * @public
     * @todo move cancel to create controller
     */
    @action cancel() {
        let _self = this;
        let model = _self.get("model");
        let intl = _self.intl;

        if (_self.hasChanged(model)) {
            let message = new Messenger().post({
                message: intl.t("global.form.cancelcicked").toString(),
                type: "warning",
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: intl.t("global.form.confirmcancel").toString(),
                        action: function () {
                            message.cancel();
                            _self.afterCancel(model);
                        },
                    },
                    cancel: {
                        label: intl.t("global.form.onsecondthought").toString(),
                        action: function () {
                            message.cancel();
                        },
                    },
                },
            });
        } else {
            _self.afterCancel(model);
        }
    }

    /**
     * This function is used to actually save the model
     *
     * @method _save
     * @param model
     * @private
     */
    _save(model, resolve, reject) {
        let _self = this;
        return model
            .save()
            .then(function (data) {
                _self.afterSave(data).then(function () {
                    _self.showSuccess(data);
                    _self.navigateToSuccess(data);
                    resolve();
                });
            })
            .catch((e) => {
                reject();
            });
    }

    /**
     * This a placeholder function that is called before we call
     * the model save
     *
     * @method beforeSave
     * @param model
     * @protected
     */
    beforeSave() {}

    /**
     * This a placeholder function that is called after we call
     * the model save
     *
     * @method after
     * @param model
     * @protected
     */
    afterSave() {
        return hash({});
    }

    /**
     * This function is used to validate the given model. If validations are passed then
     * save the model.
     *
     * @method validate
     * @param model
     * @param schemaName
     * @protected
     */
    validate(model, schemaName) {
        return new Promise((resolve) => {
            try {
                this.beforeValidate(model);
                this[schemaName].validateSync(model, { abortEarly: false });

                resolve({
                    isValid: true,
                });
            } catch (e) {
                resolve({
                    isValid: false,
                    errors: e,
                });
            }
        });
    }

    /**
     * This a placeholder function that is called before we call
     * the validate function on a model
     *
     * @method beforeValidate
     * @param model
     * @protected
     */
    beforeValidate() {}

    /**
     * This a placeholder function that is called after we call
     * the validate function on a model
     *
     * @method afterSave
     * @param model
     * @protected
     */
    afterValidate() {}

    /**
     * This function is called when we need to show a success
     * message
     *
     * @method showSuccess
     * @param model
     * @protected
     */
    showSuccess(model) {
        let _self = this;
        new Messenger().post({
            message: _self.getSuccessMessage(model),
            type: "success",
            showCloseButton: true,
        });
    }

    /**
     * This is a placeholder function that is called to get the
     * message that need to be displayed in case of success
     *
     * @method getSuccessMessage
     * @protected
     */
    getSuccessMessage() {
        return "";
    }

    /**
     * This is a placeholder function that is called to navigate
     * after successfully saving a record
     *
     * @method navigateToSuccess
     * @param model
     * @protected
     */
    navigateToSuccess() {}

    /**
     * This function is called when we need to show an error
     * message
     *
     * @method showSuccess
     * @param {Error} validationError
     * @param {string} module The module for which we are showing the error. This can be multiple modules in same view/template.
     * @private
     */
    _showError(validationError, module) {
        let _self = this;
        module = module || _self.get("module");
        Logger.debug(module);
        let messages = _self._buildMessages(validationError, module);

        new Messenger().post({
            message: messages,
            type: "error",
            showCloseButton: true,
        });
    }

    /**
     * This is the placeholder function to find out if the model has
     * changed, this function must be implemented but individual
     * controllers.
     *
     * @method hasChanged
     * @param model
     * @protected
     */
    hasChanged(model) {
        return _.size(model.changedAttributes()) > 0;
    }

    /**
     * This is a placeholder function that is called after the cancel
     * confirm box has been dismissed in confirmation
     *
     * @method afterCancel
     * @protected
     */
    afterCancel() {}

    /**
     * This function is used to rollback the attributes of the given model if
     * there is any change occurred in the model.
     *
     * @param {Prometheus.Models} model
     */
    @action resetModelAttributes(model) {
        model.rollbackAttributes();
    }
}
