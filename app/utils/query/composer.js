/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { group, normalize } from 'prometheus/utils/query/ast';

/**
 * Combine a fixed base query (a board's own filter, for example) with what the user searched.
 *
 * @class Composer
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * AND the base tree with the user's tree and normalize the result. Either tree may be missing.
 *
 * @method compose
 * @param {Object} [baseTree]
 * @param {Object} [userTree]
 * @return {Object} The normalized tree
 */
export function compose(baseTree, userTree) {
    return normalize(group('AND', [baseTree, userTree].filter(Boolean)));
}
