/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'prometheus/config/environment';
import _ from "lodash";

/**
 * This is the core application controller that contains the basic login
 * that we want to support
 *
 * @class Prometheus
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default class PrometheusController extends Controller {

    /**
     * The session service which is offered by ember-simple-auth
     *
     * @property session
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service('session') session;

    /**
     * The service that we use to maintain the currentUser
     *
     * @property currentUser
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service('current-user') currentUser;

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service('intl') intl;

    /**
     * The store service that is used to interact ember data APIs.
     *
     * @property store
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service('store') store;

    /**
     * The router service provides access to route
     *
     * @property router
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service('router') router;

    /**
     * API's host.
     * 
     * @property apiHost
     * @type String
     * @for Prometheus.Controllers.Prometheus
     */
    apiHost = ENV.api.host;

    /**
     * This action helps us set a related fields
     *
     * @param {Prometheus.Models} model
     * @param {String} field
     * @param {Object} target
     * @public
     */
    @action selectRelated(model, field, target) {
        model.set(field, target.value);
    }

    /**
     * This action helps us set a related fields
     *
     * @param {Object} obj
     * @param {String} field
     * @param {Object} target
     * @public
     */
    @action selectStatic(obj, field, target) {
        debugger;
        obj.set(field, target);
    }

    /**
     * This function builds human readable error messages.
     *
     * @method _buildMessages
     * @param validationError
     * @param module
     * @for Prometheus.Controllers.Prometheus
     * @protected
     */
    @action _buildMessages(validationError, module) {
        let _self = this;
        let intl = _self.intl;
        let messages = [];

        if (module != undefined) {
            _.each(validationError.inner, function (error, i) {
                let translatedLabel = intl.t('views.app.' + module + '.fields.' + error.path)
                let _translationOptions = {};

                if (error.type === 'oneOf') {
                    let dependentField = error.params.values;
                    dependentField = dependentField.substring(dependentField.indexOf('(') + 1, dependentField.length - 1)
                    
                    let translatedDependentField = intl.t('views.app.' + module + '.fields.' + dependentField);
                    _translationOptions = {
                        dependentField: translatedDependentField
                    }
                }

                let translatedMessage = intl.t(`errors.${error.type}`, _translationOptions);
                let message = `<b>${translatedLabel}:</b> ${translatedMessage}`;

                //add "|" pipe symbol in the end of message
                (i < (validationError.inner.length - 1)) && (message += ' | ');
                messages.push(message);
            });
        }
        return _.join(messages, "<br\\>");
    }
}