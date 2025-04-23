/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ENV from "prometheus/config/environment";

/**
 * Helper function to retrieve the current URL of the browser.
 *
 * This function uses the router service and obtain the current URL. It can be useful in scenarios where we need to programmatically 
 * retrieve and work with the current URL within the application and also in the testing.
 *
 * @function getCurrentUrl
 * @returns {string} The current URL of the browser.
 */
export default function getCurrentUrl(router) {
    return (ENV.environment == 'test') ? router.location.path : router.location.getURL();
}