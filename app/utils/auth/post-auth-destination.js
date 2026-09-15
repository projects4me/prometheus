/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/** Default Ember route name after a successful sign-in. */
export const DEFAULT_POST_AUTH_ROUTE = 'app';

const BLOCKED_POST_AUTH_PATHS = new Set(['/', '/signin', '/sign']);

/**
 * Returns true when the URL must not be used as a post-authentication destination
 * (sign-in entry routes and the unauthenticated root).
 *
 * @param {String} url
 * @returns {Boolean}
 */
export function isBlockedPostAuthUrl(url) {
    if (!url) {
        return true;
    }

    const path = url.split('?')[0].replace(/\/+$/, '') || '/';

    return BLOCKED_POST_AUTH_PATHS.has(path);
}

/**
 * Resolves where to send the user after authentication (local sign-in or cross-tab sync).
 *
 * @param {Object} options
 * @param {String} [options.fallbackRoute]
 * @param {String} [options.oldRequestedUrl]
 * @returns {String} Route name or URL path for `RouterService#transitionTo`
 */
export function resolvePostAuthDestination(options = {}) {
    const fallbackRoute = options.fallbackRoute || DEFAULT_POST_AUTH_ROUTE;
    const normalizedFallback =
        fallbackRoute === 'index' ? DEFAULT_POST_AUTH_ROUTE : fallbackRoute;
    const oldRequestedUrl = options.oldRequestedUrl;

    if (oldRequestedUrl && !isBlockedPostAuthUrl(oldRequestedUrl)) {
        return oldRequestedUrl;
    }

    return normalizedFallback;
}
