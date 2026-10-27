/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

const STORAGE_KEY = 'field-info-hidden';

/**
 * This service remembers which field info ("i") bubbles the user has hidden. The hidden keys
 * are saved to localStorage so the choice survives reloads and later sessions.
 *
 * @class FieldInfo
 * @namespace Prometheus.Services
 * @extends Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FieldInfoService extends Service {
	/**
	 * Keys of the bubbles that are hidden
	 *
	 * @property hidden
	 * @type Array
	 * @for FieldInfo
	 * @private
	 */
	@tracked hidden = this.load();

	/**
	 * Reads the hidden keys from localStorage, or an empty list when it is unavailable.
	 *
	 * @method load
	 * @return {Array}
	 * @private
	 */
	load() {
		try {
			let keys = JSON.parse(localStorage.getItem(STORAGE_KEY));
			return Array.isArray(keys) ? keys : [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Whether the bubble with the given key is hidden.
	 *
	 * @method isHidden
	 * @param {String} key
	 * @return {Boolean}
	 */
	isHidden(key) {
		return this.hidden.includes(key);
	}

	/**
	 * Hides the bubble if it is shown and shows it if it is hidden, then saves the choice.
	 *
	 * @method toggle
	 * @param {String} key
	 */
	toggle(key) {
		this.hidden = this.isHidden(key)
			? this.hidden.filter((k) => k !== key)
			: [...this.hidden, key];

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.hidden));
		} catch (e) {
			// Storage is unavailable; the choice only lasts for this page.
		}
	}
}
