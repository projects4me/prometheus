/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The item at an index of a plain array or of an Ember Data record array.
 *
 * Ember 6 dropped the Array prototype extensions, so a plain array has no `objectAt`, while the Ember Data 4.1
 * record arrays still do.
 *
 * @method objectAt
 * @param {Array|Object} list A plain array or a record array
 * @param {Number} index The position, negative counts from the end
 * @returns {*} The item, undefined when the position is out of range or there is no list
 * @public
 */
export function objectAt(list, index) {
	if (!list) {
		return undefined;
	}
	if (typeof list.objectAt === 'function') {
		return list.objectAt(index);
	}
	return Array.isArray(list) ? list.at(index) : undefined;
}

export default objectAt;
