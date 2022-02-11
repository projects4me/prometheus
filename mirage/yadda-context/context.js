/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This class is used to share the state between different test cases.
 *
 * @class Context
 * @namespace Prometheus.Tests
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class Context {

    /**
     * This function return singleton object of Context.
     *
     * @method constructor
     * @public
     */
    constructor() {
        (!Context.instance) && (Context.instance = this);
        return Context.instance;
    }

    /**
     * This function is used to set property that will be shared and used by some other
     * test cases.
     *
     * @method set
     * @param {String} property
     * @param {Object} value
     * @public
     */
    set(property, value) {
        this[property] = value;
    }

    /**
     * This function returns the property that is used by some other test cases.
     *
     * @method get
     * @param {String} property
     * @public
     */
    get(property) {
        return this[property];
    }
}