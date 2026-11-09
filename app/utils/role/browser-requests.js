/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { DEFAULT_PAGE, DEFAULT_SORT, DEFAULT_ORDER } from 'prometheus/utils/role/browser-defaults';

/**
 * The Gaia requests of the role browser, as pure functions of the browser's query params
 *
 * @module Utils.Role
 */

/**
 * The options of the role list query (without the limit, which the ListLoader adds). Grouping by access tier only
 * regroups the loaded page, so it does not change the request.
 *
 * @method buildRoleListRequest
 * @param {Object} [values] The query, page, sort, order and group params of the browser
 * @returns {Object}
 */
export function buildRoleListRequest({ query, page, sort, order } = {}) {
    let request = {
        sort: sort || DEFAULT_SORT,
        order: order || DEFAULT_ORDER,
        page: page || DEFAULT_PAGE
    };
    if (query) {
        request.query = `(${query})`;
    }
    return request;
}

/**
 * The options of the query of the user assignments of the given roles with their users, null when there are none
 *
 * @method buildUserrolesRequest
 * @param {Array} roleIds
 * @returns {Object|null}
 */
export function buildUserrolesRequest(roleIds) {
    if (!roleIds.length) {
        return null;
    }
    let conditions = roleIds.map(id => `(Userrole.roleId : ${id})`).join(' OR ');
    return { query: `(${conditions})`, rels: 'user', limit: -1 };
}
