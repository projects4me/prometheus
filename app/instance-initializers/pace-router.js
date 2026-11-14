/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Restarts the Pace progress bar whenever a route transition begins. Pace's own
 * request tracking is configured separately (vendor/pace and utils/ui/pace-config).
 *
 * @method initialize
 * @param {Object} appInstance The appInstance manages the state of application
 * @private
 */
export function initialize(appInstance) {
    const router = appInstance.lookup('service:router');

    router.on('routeWillChange', () => {
        if (typeof Pace !== 'undefined') {
            Pace.restart();
        }
    });
}

/**
 * Instance initializer wiring the router service to Pace.
 *
 * @class PaceRouter
 * @namespace Prometheus.InstanceInitializers
 */
export default {
    name: 'pace-router',
    initialize
};
