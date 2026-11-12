/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Whether a value is an Ember Data PromiseManyArray, the proxy an async hasMany returns before it is awaited.
 *
 * @method isPromiseManyArray
 * @param {*} value Any value
 * @returns {Boolean} True for a PromiseManyArray
 * @public
 */
export function isPromiseManyArray(value) {
	return !!value && typeof value.then === 'function' && 'content' in value && 'isFulfilled' in value;
}

/**
 * A plain array copy of a list: a plain array, an Ember Data record array or ManyArray, or a PromiseManyArray
 * (its loaded records, or none while it is still loading).
 *
 * Ember Data 4.12 deprecates the Ember Array methods (`toArray`, `objectAt`, …) on its record arrays and every
 * array method on a PromiseManyArray; they go in Ember Data 5.0. Use this instead of `list.toArray()`.
 *
 * @method toArray
 * @param {Array|Object} list A plain array, a record array, a ManyArray or a PromiseManyArray
 * @returns {Array} A new plain array, empty when there is no list
 * @public
 */
export function toArray(list) {
	if (!list) {
		return [];
	}
	let items = isPromiseManyArray(list) ? list.content : list;
	if (!items) {
		return [];
	}
	if (Array.isArray(items) || typeof items[Symbol.iterator] === 'function') {
		return Array.from(items);
	}
	return typeof items.toArray === 'function' ? items.toArray() : [];
}

export default toArray;
