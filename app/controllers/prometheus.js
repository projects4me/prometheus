/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
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
        obj.set(field, target);
    }

    /**
     * This function builds human readable error messages.
     *
     * @method _buildMessages
     * @param validations
     * @param module
     * @for Prometheus.Controllers.Prometheus
     * @private
     */
    @action _buildMessages(validations, module) {
        let _self = this;
        let intl = _self.intl;
        let messages = [];

        if (module != undefined) {
            _.each(validations.errors, function (error) {
                messages.push(intl.t('views.app.' + module + '.fields.' + error.attribute) + ' : ' + error.message);
            });
        }
        return _.join(messages, "<br\\>");
    }
}