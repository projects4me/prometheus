/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * A stand-in for the record array a store query returns. From Ember Data 4.12 a record array is a native array
 * (with the query's `meta`), and its Ember Array methods such as `toArray` are deprecated.
 *
 * @method recordArray
 * @param {Array} items The records
 * @param {Object} [meta] The query's meta
 * @return {Array} A copy of the items, carrying the meta
 */
export function recordArray(items, meta) {
  let list = [...items];
  if (meta !== undefined) {
    list.meta = meta;
  }
  return list;
}

export default recordArray;
