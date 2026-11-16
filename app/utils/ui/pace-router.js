/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Restarts the Pace progress bar whenever a route transition begins. Pace's own
 * request tracking is configured separately (vendor/pace and utils/ui/pace-config).
 *
 * @method restartPaceOnTransition
 * @param {Ember.Service} router The router service
 * @public
 */
export function restartPaceOnTransition(router) {
    router.on('routeWillChange', () => {
        if (typeof Pace !== 'undefined') {
            Pace.restart();
        }
    });
}
