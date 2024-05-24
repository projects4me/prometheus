/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import ForbiddenError from '../adapters/errors/forbidden-error';
import UnauthorizedError from '../adapters/errors/unauthorized-error';

/**
 * This service is used for handling route related errors.
 *
 * @class ErrorManagerService
 * @namespace Prometheus.Services
 * @extends Ember.service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ErrorManagerService extends Service {

    /**
     * The Ember router service provides access to route
     *
     * @property router
     * @type Ember.Service
     * @for ErrorManagerService
     * @public
     */
    @service router;

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    @service session;

    /**
     * Constructor method for this service class. In this method we're setting up a Map for different types of error
     * handlers.
     * 
     * @method constructor
     */
    constructor() {
        super(...arguments);
        this.errorHandlers = new Map([
            [UnauthorizedError, this._handleUnauthorizedError],
            [ForbiddenError, this._handleForbiddenError],
        ]);
    }

    /**
     * This function is the main API for handling the errors. This method further calls the type of
     * error which is caught against an API call. If none of the handler is available for the error then
     * it throws the error up towards the error hook in app route.
     * 
     * @param {Object} error The error object. 
     * @param {*} options  Options object provided to each error handlers.
     * @returns {void}
     * @throws {Object} error
     */
    handleError(error, options = {}) {
        let handler = this.errorHandlers.get(error.constructor)
        if (handler) {
            return handler.call(this, error, options);
        } else {
            // Bubble error to the error() hook in app route.
            throw error;
        }
    }

    /**
     * This function is the handler for the error of type forbidden. If user faces an error of type Forbidden
     * against the main module e.g. project then it redirects user to access denied route. E.g. in route of 
     * app/project/123, there are two API request initiated, one for the project and one for issue. If user has
     * no access no main module, which is project in this case, then we'll redirect user to access-denied route
     * and if user has no access to secondary module, which is issue, then there is no need for redirection to
     * access-denied route.
     * 
     * @param {Prometheus.Errors.ForbiddenError} error The Forbidden error object. 
     * @param {*} options  Options object.
     */
    _handleForbiddenError(error, options) {
        if (options.moduleName &&
            error.errors.toLowerCase() === `access denied to ${options.moduleName.toLowerCase()}`) {
            this.router.transitionTo('app.access-denied');
        }
    }

    /**
     * This function is the handler for the error of type forbidden. If the user is unauthorized to call an API then
     * this function invalidate the current sesssion to make user login again to the application.
     * 
     * @param {Prometheus.Errors.UnauthorizedError} error The Unauthorized error object. 
     * @param {*} options  Options object.
     */
    _handleUnauthorizedError(error, options) {
        this.session.invalidate();
    }
}