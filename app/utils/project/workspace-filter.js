/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

const CLAUSE = /\(\s*Project\.workspaceId\s*:\s*([^)\s]+)\s*\)/;
const CLAUSE_WITH_AND = /\s*(?:AND\s*)?\(\s*Project\.workspaceId\s*:\s*[^)\s]+\s*\)(?:\s*AND)?/;

/**
 * Reads the workspace the query filters the projects by
 *
 * @method workspaceIdOf
 * @param {String} query The Gaia query string
 * @return {String|null} The workspace id, null without a workspace clause
 */
export function workspaceIdOf(query) {
    let match = (query || '').match(CLAUSE);
    return match ? match[1] : null;
}

/**
 * Returns the query with its workspace clause replaced by the given workspace, or removed when empty
 *
 * @method withWorkspace
 * @param {String} query The Gaia query string
 * @param {String|null} workspaceId The workspace to filter by, empty for all
 * @return {String} The new query, empty for none
 */
export function withWorkspace(query, workspaceId) {
    let base = (query || '').replace(CLAUSE_WITH_AND, ' ').replace(/\(\s*\)/g, '').trim();
    if (base === '' || base === '()') {
        base = '';
    }
    if (!workspaceId) {
        return base;
    }
    let clause = `(Project.workspaceId : ${workspaceId})`;
    if (base === '') {
        return `(${clause})`;
    }
    return base.replace(/\)\s*$/, ` AND ${clause})`);
}
