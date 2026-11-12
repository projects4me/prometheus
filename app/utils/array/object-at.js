/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import { isPromiseManyArray } from './to-array';

/**
 * The item at an index of a plain array, an Ember Data record array or ManyArray, or a PromiseManyArray.
 *
 * Ember 6 dropped the Array prototype extensions, so a plain array has no `objectAt`, and Ember Data 4.12
 * deprecates `objectAt` on its record arrays (gone in 5.0); both support the native `at`.
 *
 * @method objectAt
 * @param {Array|Object} list A plain array, a record array or a PromiseManyArray
 * @param {Number} index The position, negative counts from the end
 * @returns {*} The item, undefined when the position is out of range or there is no list
 * @public
 */
export function objectAt(list, index) {
	let items = isPromiseManyArray(list) ? list.content : list;
	if (!items) {
		return undefined;
	}
	if (typeof items.at === 'function') {
		return items.at(index);
	}
	return typeof items.objectAt === 'function' ? items.objectAt(index) : undefined;
}

export default objectAt;
