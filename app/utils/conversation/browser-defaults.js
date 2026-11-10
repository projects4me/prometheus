/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The defaults of the thread browser's search, paging, sort and grouping query params, shared by the route and the
 * controller
 *
 * @module Utils.Conversation
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT = 'Conversationroom.dateModified';
export const DEFAULT_ORDER = 'DESC';
export const DEFAULT_GROUP = 'milestone';

/**
 * The UrlState schema of the thread browser's query params, shared by the route (queryParams) and the controller
 * (UrlState). A change to any of them other than page sends the list back to the first page.
 *
 * @property BROWSER_PARAMS
 * @type Object
 */
export const BROWSER_PARAMS = {
    query: { default: '', type: 'string' },
    page: { default: DEFAULT_PAGE, type: 'number', resetOnChange: true },
    sort: { default: DEFAULT_SORT, type: 'string' },
    order: { default: DEFAULT_ORDER, type: 'string' },
    group: { default: DEFAULT_GROUP, type: 'string' }
};

/**
 * The browser's query params with their defaults filled in, from the params a route's model hook receives
 *
 * @method browserValues
 * @param {Object} [params] the route params
 * @returns {Object} query, page, sort, order and group
 */
export function browserValues(params = {}) {
    let page = Number(params.page);
    return {
        query: params.query || '',
        page: Number.isFinite(page) && page > 0 ? page : DEFAULT_PAGE,
        sort: params.sort || DEFAULT_SORT,
        order: params.order || DEFAULT_ORDER,
        group: params.group || DEFAULT_GROUP
    };
}
