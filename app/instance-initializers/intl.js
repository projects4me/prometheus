/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This function is called by Emberjs by default on the application bootup.
 * In this we are setting up the default locale of intl. Because of that we don't need to
 * import intl and setup locale everytime in all test files and also in the application.
 * The backend translations and the user's locale are loaded later by the translations service.
 *
 * @method initialize
 * @param {Object} appInstance The appInstance manages the state of application
 * @private
 */
export function initialize(appInstance) {
    appInstance.lookup('service:translations').useDefaultLocale();
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
