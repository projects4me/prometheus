/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { buildSort } from 'prometheus/utils/ideas/list-options';
import { DEFAULT_PAGE, DEFAULT_ORDER } from 'prometheus/utils/idea/browser-defaults';

/**
 * The Gaia requests of the idea browser, as pure functions of the project and the browser's query params
 *
 * @module Utils.Idea
 */

/**
 * The Gaia query of the listed ideas: the ideas of the project, only the open ones unless the archived ones are
 * shown, narrowed by the search.
 *
 * @method buildIdeaQuery
 * @param {String} projectId
 * @param {Object} [values]
 * @param {String} [values.query] A Gaia query the ideas must match as well
 * @param {Boolean} [values.archived] Whether the archived ideas are listed too
 * @returns {String}
 */
export function buildIdeaQuery(projectId, { query, archived } = {}) {
    let conditions = [`(Idea.projectId : ${projectId})`];
    if (!archived) {
        conditions.push('(Idea.status : open)');
    }
    if (query) {
        conditions.push(`(${query})`);
    }
    return conditions.length > 1 ? `(${conditions.join(' AND ')})` : conditions[0];
}

/**
 * The options of the idea list query (without the limit, which the ListLoader adds): the ideas with their creator,
 * the only relation the browser needs. Grouping by plan status does not change the request.
 *
 * @method buildIdeaListRequest
 * @param {String} projectId
 * @param {Object} [values] The query, page, sort, order, group and archived params of the browser
 * @returns {Object}
 */
export function buildIdeaListRequest(projectId, values = {}) {
    return {
        query: buildIdeaQuery(projectId, values),
        rels: 'createdBy',
        sort: buildSort(values),
        order: values.order || DEFAULT_ORDER,
        page: values.page || DEFAULT_PAGE
    };
}

/**
 * The options of the query that counts the archived ideas of the project; it loads no relations
 *
 * @method buildArchivedCountRequest
 * @param {String} projectId
 * @returns {Object}
 */
export function buildArchivedCountRequest(projectId) {
    return { query: `((Idea.projectId : ${projectId}) AND (Idea.status : archived))`, rels: 'none', limit: -1 };
}

/**
 * The options of the query of the plans of the given ideas, null when there are none
 *
 * @method buildPlansRequest
 * @param {Array} ideaIds
 * @returns {Object|null}
 */
export function buildPlansRequest(ideaIds) {
    if (!ideaIds.length) {
        return null;
    }
    let conditions = ideaIds.map(id => `(Ideaplan.ideaId : ${id})`).join(' OR ');
    return { query: `(${conditions})`, limit: -1 };
}
