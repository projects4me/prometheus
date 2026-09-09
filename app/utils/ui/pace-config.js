/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import config from "prometheus/config/environment";

/**
 * Socket.IO long-polling and handshake paths. All Socket.IO clients use this
 * segment regardless of host or transport upgrade.
 *
 * @property SOCKET_IO_PATH
 * @type String
 * @private
 */
const SOCKET_IO_PATH = "/socket.io/";

/**
 * Static URL markers for real-time transport traffic Pace must never track.
 * Add entries here when introducing additional WebSocket or long-polling
 * clients so exclusions stay centralized.
 *
 * @property TRANSPORT_URL_MARKERS
 * @type ReadonlyArray<String>
 * @public
 */
export const TRANSPORT_URL_MARKERS = Object.freeze([SOCKET_IO_PATH]);

/**
 * Build Pace ajax.ignoreURLs patterns for Socket.IO and Hermes traffic.
 *
 * @method buildTransportIgnoreUrls
 * @param {String} hermesUrl Hermes origin from ENV.hermes.url
 * @returns {Array<String>} URL substrings Pace should ignore
 * @public
 */
export function buildTransportIgnoreUrls(hermesUrl = config.hermes?.url) {
    let patterns = [...TRANSPORT_URL_MARKERS];

    if (!hermesUrl) {
        return patterns;
    }

    let normalized = String(hermesUrl).replace(/\/$/, "");
    if (normalized && patterns.indexOf(normalized) === -1) {
        patterns.push(normalized);
    }

    try {
        let origin = new URL(normalized).origin;
        if (origin && patterns.indexOf(origin) === -1) {
            patterns.push(origin);
        }
    } catch (_error) {
        // keep the normalized string fallback above
    }

    return patterns;
}

/**
 * Merge ignore URL patterns without duplicates.
 *
 * @method mergeIgnoreUrls
 * @param {Array} existing Current Pace ignore list
 * @param {Array} additions Patterns to append
 * @returns {Array} Combined ignore list
 * @private
 */
function mergeIgnoreUrls(existing = [], additions = []) {
    let merged = Array.isArray(existing) ? existing.slice() : [];
    additions.forEach((pattern) => {
        if (merged.indexOf(pattern) === -1) {
            merged.push(pattern);
        }
    });
    return merged;
}

/**
 * Apply transport exclusions to Pace.options once ENV is available. WebSocket
 * tracking is disabled in vendor/pace/pace-options.js before Pace loads;
 * this merges Hermes-specific origins and any future transport markers.
 *
 * @method applyPaceTransportExclusions
 * @param {String} hermesUrl Hermes origin from ENV.hermes.url
 * @returns {void}
 * @public
 */
export function applyPaceTransportExclusions(hermesUrl = config.hermes?.url) {
    if (typeof Pace === "undefined") {
        return;
    }

    Pace.options = Pace.options || {};
    Pace.options.ajax = Pace.options.ajax || {};
    Pace.options.ajax.trackWebSockets = false;
    Pace.options.ajax.ignoreURLs = mergeIgnoreUrls(
        Pace.options.ajax.ignoreURLs,
        buildTransportIgnoreUrls(hermesUrl)
    );
}

/**
 * Returns true when a request URL belongs to excluded real-time transport.
 * Useful for tests and future interceptors that need the same guard.
 *
 * @method shouldIgnoreTransportUrl
 * @param {String} url Request or WebSocket URL
 * @param {String} hermesUrl Hermes origin from ENV.hermes.url
 * @returns {Boolean}
 * @public
 */
export function shouldIgnoreTransportUrl(
    url,
    hermesUrl = config.hermes?.url
) {
    if (!url) {
        return false;
    }

    return buildTransportIgnoreUrls(hermesUrl).some((pattern) => {
        return url.indexOf(pattern) !== -1;
    });
}
