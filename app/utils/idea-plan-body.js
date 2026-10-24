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
            issues: body.issues.filter(issue => issue && typeof issue === 'object')
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
