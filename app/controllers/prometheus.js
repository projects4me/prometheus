/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject } from '@ember/service';
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
export default Controller.extend({

    /**
     * The session service which is offered by ember-simple-auth
     *
     * @property session
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    session: inject(),

    /**
     * The service that we use to maintain the currentUser
     *
     * @property currentUser
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    currentUser: inject('current-user'),

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    i18n: inject(),

    /**
     * These are the events that this controller handles
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions: {

        /**
         * This action helps us set a related fields
         *
         * @param {Prometheus.Models} model
         * @param {String} field
         * @param {Object} target
         * @public
         */
        selectRelated(model, field, target) {
            model.set(field, target.value);
        },

        /**
         * This action helps us set a related fields
         *
         * @param {Object} obj
         * @param {String} field
         * @param {Object} target
         * @public
         */
        selectStatic(obj, field, target) {
            obj.set(field, target);
        },
    },

    /**
     * This function builds human readable error messages.
     *
     * @method _buildMessages
     * @param validations
     * @param module
     * @for Prometheus.Controllers.Prometheus
     * @private
     */
    _buildMessages(validations, module){
        let _self = this;
        let i18n = _self.get('i18n');
        let messages = [];

        if (module != undefined) {
            _.each(validations.errors,function(error){
                messages.push(i18n.t('views.app.'+module+'.fields.'+error.attribute)+' : '+error.message);
            });
        }
        return _.join(messages,"<br\\>");
    }

});