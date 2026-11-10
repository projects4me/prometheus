/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/** localStorage key holding the persisted auth event ring buffer. */
export const AUTH_LOG_KEY = 'prometheus_auth_log';

/** Maximum number of entries kept. */
export const AUTH_LOG_MAX = 100;

const SENSITIVE = /token|password|secret|authorization|code/i;
const MAX_STRING = 200;

let tabId = null;

/**
 * Identifier of this browser tab (random, per page load).
 *
 * @method getTabId
 * @return {String}
 */
export function getTabId() {
    if (!tabId) {
        tabId = Math.random().toString(36).slice(2, 8);
    }

    return tabId;
}

/**
 * Drops sensitive keys and truncates long strings from a detail object.
 *
 * @method redact
 * @param {Object} detail
 * @return {Object}
 */
export function redact(detail) {
    const out = {};

    Object.keys(detail || {}).forEach((key) => {
        if (SENSITIVE.test(key)) {
            return;
        }
        const value = detail[key];

        if (value === null || ['number', 'boolean'].includes(typeof value)) {
            out[key] = value;
        } else if (typeof value === 'string') {
            out[key] = value.slice(0, MAX_STRING);
        } else if (value !== undefined) {
            out[key] = String(value).slice(0, MAX_STRING);
        }
    });

    return out;
}

/**
 * Reads the persisted entries, oldest first. Never throws.
 *
 * @method readAuthLog
 * @return {Array<Object>}
 */
export function readAuthLog() {
    try {
        const parsed = JSON.parse(localStorage.getItem(AUTH_LOG_KEY));

        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

/**
 * Appends one event to the persisted ring buffer. Never throws and never
 * stores tokens, passwords or secrets (sensitive detail keys are dropped).
 *
 * @method logAuthEvent
 * @param {String} event
 * @param {Object} [detail]
 */
export function logAuthEvent(event, detail = {}) {
    try {
        const entries = readAuthLog();

        entries.push({
            time: Date.now(),
            tab: getTabId(),
            event,
            detail: redact(detail),
        });
        localStorage.setItem(AUTH_LOG_KEY, JSON.stringify(entries.slice(-AUTH_LOG_MAX)));
    } catch (e) {
        // logging must never break authentication
    }
}

/**
 * Empties the persisted log.
 *
 * @method clearAuthLog
 */
export function clearAuthLog() {
    try {
        localStorage.removeItem(AUTH_LOG_KEY);
    } catch (e) {
        // ignore
    }
}
