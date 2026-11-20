/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Decodes the body of an idea plan, which Gaia stores as a JSON string
 *
 * @method decodePlanBody
 * @param {String|Object} body
 * @returns {Object} the body object, with the summary text when the body is not JSON and without invalid issue entries
 * @public
 */
export default function decodePlanBody(body) {
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (error) {
            body = { summary: body };
        }
    }
    if (body && typeof body === 'object' && Array.isArray(body.issues)) {
        return {
            ...body,
            issues: body.issues.filter(issue => issue && typeof issue === 'object' && !Array.isArray(issue))
        };
    }
    return body && typeof body === 'object' ? body : {};
}

/**
 * Tells whether a project is among the readable project ids, comparing ids as strings
 *
 * @method isProjectReadable
 * @param {String|Number} projectId
 * @param {Array} readableProjectIds
 * @returns {Boolean}
 * @public
 */
export function isProjectReadable(projectId, readableProjectIds) {
    return projectId != null && (readableProjectIds ?? []).includes(String(projectId));
}

/**
 * Sets the milestone of every planned issue of a plan body and returns the body as the JSON string Gaia stores.
 * Every other field of the body and of the issues stays as it was, also entries the decoder would filter out.
 *
 * @method withPlanMilestone
 * @param {String|Object} body
 * @param {String} milestone the milestone name
 * @returns {String}
 * @public
 */
export function withPlanMilestone(body, milestone) {
    let raw = body;
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            raw = { summary: raw };
        }
    }
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    if (Array.isArray(raw.issues)) {
        raw = {
            ...raw,
            issues: raw.issues.map(issue => (issue && typeof issue === 'object' && !Array.isArray(issue) ? { ...issue, milestone } : issue))
        };
    }
    return JSON.stringify(raw);
}

/**
 * The milestone all planned issues share
 *
 * @method sharedPlanMilestone
 * @param {Array} issues the planned issues of a decoded body
 * @returns {String|null|undefined} the name, null when no issue has one, undefined when they differ
 * @public
 */
export function sharedPlanMilestone(issues) {
    let names = new Set((issues ?? []).map(issue => issue.milestone || null));
    if (names.size > 1) {
        return undefined;
    }
    return names.size ? [...names][0] : null;
}
