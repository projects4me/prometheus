/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Pace reads window.paceOptions when vendor/pace/pace.min.js loads. WebSocket
 * interceptors are installed at that moment, so real-time transport must be
 * excluded here. Hermes-specific origins are merged later from
 * utils/ui/pace-config.js once ENV is available.
 */
window.paceOptions = window.paceOptions || {};
window.paceOptions.ajax = window.paceOptions.ajax || {};
window.paceOptions.ajax.trackWebSockets = false;
window.paceOptions.ajax.ignoreURLs = window.paceOptions.ajax.ignoreURLs || [];

if (window.paceOptions.ajax.ignoreURLs.indexOf("/socket.io/") === -1) {
    window.paceOptions.ajax.ignoreURLs.push("/socket.io/");
}
