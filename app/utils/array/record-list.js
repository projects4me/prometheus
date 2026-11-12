/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import { isPromiseManyArray } from './to-array';

/**
 * Changes to an Ember Data record list (a ManyArray, a RecordArray or the PromiseManyArray of an async hasMany)
 * through the native array methods.
 *
 * Ember Data 4.12 deprecates the Ember Array mutators (`pushObject`, `pushObjects`, `addObject`, `removeObject`,
 * `clear`, `insertAt`) on its arrays and every array method on a PromiseManyArray; they go in Ember Data 5.0.
 * A PromiseManyArray is changed through its loaded ManyArray; while it is still loading nothing changes.
 *
 * @class RecordList
 * @namespace Prometheus.Utils.Array
 */

/**
 * The array to change: the list itself, or the loaded ManyArray of a PromiseManyArray.
 *
 * @method target
 * @param {Object} list An Ember Data record list
 * @returns {Array|undefined} The array, undefined when there is none yet
 * @private
 */
function target(list) {
	return isPromiseManyArray(list) ? list.content : list;
}

/**
 * Appends records to a list.
 *
 * @method pushRecords
 * @param {Object} list An Ember Data record list
 * @param {Array} records The records to append
 * @public
 */
export function pushRecords(list, records) {
	target(list)?.push(...records);
}

/**
 * Appends a record to a list unless the list already holds it.
 *
 * @method addRecord
 * @param {Object} list An Ember Data record list
 * @param {Object} record The record
 * @public
 */
export function addRecord(list, record) {
	let items = target(list);
	if (items && !items.includes(record)) {
		items.push(record);
	}
}

/**
 * Removes a record from a list, when the list holds it.
 *
 * @method removeRecord
 * @param {Object} list An Ember Data record list
 * @param {Object} record The record
 * @public
 */
export function removeRecord(list, record) {
	let items = target(list);
	let index = items ? items.indexOf(record) : -1;
	if (index > -1) {
		items.splice(index, 1);
	}
}

/**
 * Inserts a record into a list at a position.
 *
 * @method insertRecordAt
 * @param {Object} list An Ember Data record list
 * @param {Number} index The position
 * @param {Object} record The record
 * @public
 */
export function insertRecordAt(list, index, record) {
	target(list)?.splice(index, 0, record);
}

/**
 * Replaces every record of a list.
 *
 * @method replaceRecords
 * @param {Object} list An Ember Data record list
 * @param {Array} records The new records
 * @public
 */
export function replaceRecords(list, records) {
	let items = target(list);
	items?.splice(0, items.length, ...records);
}
