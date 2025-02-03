/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'prometheus/config/environment';
import _ from 'lodash';
import generateSchemaFromMeta from 'prometheus/utils/yup/generate-schema';

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
     * The trackedProject service provides the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
	 * @for Prometheus.Controllers.Prometheus
     * @private
     */
    @service trackedProject;	

	/**
	 * The settings service maintains all of the system level configurations.
	 *
	 * @property settings
	 * @type Ember.Service
	 * @for Prometheus.Controllers.Prometheus
	 * @public
	 */
	@service settings;

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
		obj.set(field, target);
	}

	/**
	 * This function builds human readable error messages.
	 *
	 * @method _buildMessages
	 * @param validationError
	 * @param module
	 * @for Prometheus.Controllers.Prometheus
	 * @private
	 */
	@action _buildMessages(validationError, module) {
		let _self = this;
		let intl = _self.intl;
		let messages = [];
		let defaultErrorTypes = ['required', 'optionality'];

		if (module != undefined) {
			_.each(validationError.inner, function (error, i) {
				let translatedLabel = intl.t(
					'views.app.' + module + '.fields.' + error.path
				);
				let _translationOptions = {};
				let translatedMessage = '',
					message = '';
				if (defaultErrorTypes.includes(error.type)) {
					translatedMessage = intl.t(
						`errors.${error.type}`,
						_translationOptions
					);
				} else {
					translatedMessage = error.errors[0];
				}
				message = `<b>${translatedLabel}:</b> ${translatedMessage}`;

				//add "|" pipe symbol in the end of message
				i < validationError.inner.length - 1 && (message += ' | ');
				messages.push(message);
			});
		}
		return _.join(messages, '<br\\>');
	}

	/**
	 * This function is used to call generateSchemaFromMeta() utility function in order to generate schema
	 * by passing controller's metadata and then pass that array of schemas to setSchemas() method in order
	 * to set each schema in the respective class object.
	 *
	 * @method setupSchema
	 * @protected
	 */
	setupSchema() {
		let schemas = generateSchemaFromMeta(this.metadata);
		this.setSchemas(schemas);
	}

	/**
	 * This function is used to set schema for each section of metadata inside the class object.
	 *
	 * @param {Array} schemas
	 */
	setSchemas(schemas) {
		Object.entries(schemas).forEach(([key, value]) => {
			this[key] = value;
		});
	}

	/**
	 * This function scrolls to the given element and highlights it (if needed).
	 * 
	 * @method scrollAndHighlight
	 * @param {HTMLElement} element
	 * @param {Boolean} isHighlight
	 * @public
	 */
	scrollAndHighlight(element, isHighlight = false) {
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			if (isHighlight) {
				element.classList.add('highlight-box');
				setTimeout(() => {
					element.classList.remove('highlight-box');
				}, 3000);
			}
		}
	}
}
