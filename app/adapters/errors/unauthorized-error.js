/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AdapterError from '@ember-data/adapter/error';

/**
 * This is the class for handling error of type unauthorized.
 *
 * @class UnauthorizedError
 * @namespace Prometheus.Adapters.Errors
 * @extends AdapterError
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UnauthorizedError extends AdapterError {

    /**
     * This method calls the parent constructor and after that add some additional details in the detail
     * object of the class.
     * 
     * @method constructor
     * @param {string} message 
     */
    constructor(message) {
        super(message);
        localStorage.setItem('sessionExpired', true);
    }
}