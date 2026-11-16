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
 * Adding is idempotent: a record the list already holds, or one given twice, is added once. Ember Data 5.3
 * deprecates duplicates in a hasMany (`ember-data:deprecate-many-array-duplicates`) and 6.0 throws on them.
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
 * The records not yet in a list, each once, in their given order.
 *
 * @method missingRecords
 * @param {Array} items The records the list holds
 * @param {Array} records The records to add
 * @returns {Array} The records to add without the ones already held or repeated
 * @private
 */
function missingRecords(items, records) {
	let seen = new Set(items);
	return records.filter((record) => {
		if (seen.has(record)) {
			return false;
		}
		seen.add(record);
		return true;
	});
}

/**
 * Appends records to a list, skipping the ones it already holds.
 *
 * @method pushRecords
 * @param {Object} list An Ember Data record list
 * @param {Array} records The records to append
 * @public
 */
export function pushRecords(list, records) {
	let items = target(list);
	if (items) {
		let missing = missingRecords(items, records);
		if (missing.length) {
			items.push(...missing);
		}
	}
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
	pushRecords(list, [record]);
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
 * Inserts a record into a list at a position, unless the list already holds it.
 *
 * @method insertRecordAt
 * @param {Object} list An Ember Data record list
 * @param {Number} index The position
 * @param {Object} record The record
 * @public
 */
export function insertRecordAt(list, index, record) {
	let items = target(list);
	if (items && !items.includes(record)) {
		items.splice(index, 0, record);
	}
}

/**
 * Replaces every record of a list; a record given twice is kept once.
 *
 * @method replaceRecords
 * @param {Object} list An Ember Data record list
 * @param {Array} records The new records
 * @public
 */
export function replaceRecords(list, records) {
	let items = target(list);
	items?.splice(0, items.length, ...missingRecords([], records));
}
