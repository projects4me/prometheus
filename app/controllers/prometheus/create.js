/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';

/**
 * This is the controller for issue create page
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

    /**
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module: '',

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    appController: injectController('app'),

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    usersList: computed('appController.usersList', function(){
        return this.get('appController').get('usersList');
    }),

    /**
     * These are the events that this controller handles
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions:{

        /**
         * This function is responsible for saving the model.
         * After successfully saving the function takes the user to
         * the saved page.
         *
         * @method save
         * @public
         * @todo Handle the situation where we are not using validations
         */
        save:function() {
            let _self = this;
            let model = this.get('model');

            if (typeof model.validate === 'function') {
                _self.beforeValidate(model);
                model.validate().then(({ validations }) => {
                    _self.afterValidate(model, validations);
                    if (validations.get('isValid')) {
                        _self.beforeSave(model);
                        model.save().then(function(data){
                            _self.afterSave(data);
                            _self.showSuccess(data);
                            _self.navigateToSuccess(data);
                        });
                    } else {
                        _self._showError(model, validations);
                    }
                });
            }
        }
    },

    /**
     * This a placeholder function that is called before we call
     * the model save
     *
     * @method beforeSave
     * @param model
     * @protected
     */
    beforeSave(model){
    },

    /**
     * This a placeholder function that is called after we call
     * the model save
     *
     * @method after
     * @param model
     * @protected
     */
    afterSave(model){
    },

    /**
     * This a placeholder function that is called before we call
     * the validate function on a model
     *
     * @method beforeSave
     * @param model
     * @protected
     */
    beforeValidate(model){
    },

    /**
     * This a placeholder function that is called after we call
     * the validate function on a model
     *
     * @method afterSave
     * @param model
     * @protected
     */
    afterValidate(model){
    },

    /**
     * This function is called when we need to show a success
     * message
     *
     * @method showSuccess
     * @param model
     * @protected
     */
    showSuccess(model){
        let _self = this;
        new Messenger().post({
            message: _self.getSuccessMessage(model),
            type: 'success',
            showCloseButton: true
        });
    },

    /**
     * This is a placeholder function that is called to get the
     * message that need to be displayed in case of success
     *
     * @method getSuccessMessage
     * @param model
     * @protected
     */
    getSuccessMessage(model){
        return '';
    },

    /**
     * This is a placeholder function that is called to navigate
     * after successfully saving a record
     *
     * @method navigateToSuccess
     * @param model
     * @protected
     */
    navigateToSuccess(model){
    },

    /**
     * This function is called when we need to show an error
     * message
     *
     * @method showSuccess
     * @param model
     * @param validations
     * @protected
     */
    _showError(model, validations) {
        let _self = this;
        let messages = _self._buildMessages(validations,_self.get('module'));

        new Messenger().post({
            message: messages,
            type: 'error',
            showCloseButton: true
        });
    }

});
