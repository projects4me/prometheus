/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This function is called by Emberjs by default on the application bootup.
 * In this we are setting up the locale of intl. Because of that we don't need to 
 * import intl and setup locale everytime in all test files and also in the application.
 *
 * @method initialize
 * @param {Object} appInstance The appInstance manages the state of application
 * @private
 */
export function initialize(appInstance) {
    const intl = appInstance.lookup('service:intl');
    intl.setLocale('en-us');
}

/**
 * This is the instance initializer for the intl service.
 @class Intl
 @namespace Prometheus.InstanceInitializers
 @author Rana Nouman <ranamnouman@gmail.com>
 */
export default {
    initialize
};
