/**
 * Hostnames treated as loopback when rewriting ENV.hermes.url.
 *
 * @property LOOPBACK_HOSTS
 * @type Set
 * @private
 */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Point the Socket.IO client at the same hostname the page is using.
 * Firefox often opens `127.0.0.1` while the config says `localhost`; those
 * are different origins and the handshake is then blocked by CORS.
 *
 * @method resolveHermesUrl
 * @param {String} configured Hermes URL from ENV.hermes.url
 * @param {Location} location Page location used to rewrite loopback hosts
 * @returns {String} Socket.IO origin without a trailing slash
 * @public
 */
export function resolveHermesUrl(
    configured,
    location = typeof window !== "undefined" ? window.location : null
) {
    let fallback = configured || "http://localhost:9000";
    if (!location || !location.hostname) {
        return fallback;
    }

    try {
        let url = new URL(fallback);
        if (LOOPBACK_HOSTS.has(url.hostname)) {
            url.hostname = location.hostname;
        }
        return url.toString().replace(/\/$/, "");
    } catch (_error) {
        return fallback;
    }
}
