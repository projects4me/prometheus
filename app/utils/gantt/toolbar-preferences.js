/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The one localStorage key of the Gantt toolbar. Its value is JSON: `{ scale, dependencies, weekends }`.
 * `scale` is `days`, `weeks` or `months`; the two flags are booleans. The key is per browser, so per user.
 *
 * @property GANTT_TOOLBAR_KEY
 * @type String
 */
export const GANTT_TOOLBAR_KEY = 'gantt-toolbar';

const SCALES = ['days', 'weeks', 'months'];

/**
 * Reads the saved toolbar state; anything missing or invalid falls back to Weeks with both toggles on
 *
 * @function loadToolbarPreferences
 * @return {Object} `{ scale, dependencies, weekends }`
 */
export function loadToolbarPreferences() {
	let saved = {};
	try {
		saved = JSON.parse(window.localStorage.getItem(GANTT_TOOLBAR_KEY)) || {};
	} catch {
		saved = {};
	}
	return {
		scale: SCALES.includes(saved.scale) ? saved.scale : 'weeks',
		dependencies: saved.dependencies !== false,
		weekends: saved.weekends !== false
	};
}

/**
 * Saves the toolbar state; when storage is unavailable the state stays for this session only
 *
 * @function saveToolbarPreferences
 * @param {Object} preferences `{ scale, dependencies, weekends }`
 */
export function saveToolbarPreferences(preferences) {
	try {
		window.localStorage.setItem(GANTT_TOOLBAR_KEY, JSON.stringify(preferences));
	} catch {
		// storage unavailable
	}
}

/**
 * The localStorage key of the phone's layer options, kept apart from the desktop toolbar's.
 * Its value is JSON: `{ dependencies, labels, weekends }`.
 *
 * @property GANTT_PHONE_KEY
 * @type String
 */
export const GANTT_PHONE_KEY = 'gantt-toolbar-phone';

/**
 * Reads the phone's saved layer options; dependency lines and bar labels are off until turned on
 *
 * @function loadPhonePreferences
 * @return {Object} `{ dependencies, labels, weekends }`
 */
export function loadPhonePreferences() {
	let saved = {};
	try {
		saved = JSON.parse(window.localStorage.getItem(GANTT_PHONE_KEY)) || {};
	} catch {
		saved = {};
	}
	return {
		dependencies: saved.dependencies === true,
		labels: saved.labels === true,
		weekends: saved.weekends !== false
	};
}

/**
 * Saves the phone's layer options; when storage is unavailable they stay for this session only
 *
 * @function savePhonePreferences
 * @param {Object} preferences `{ dependencies, labels, weekends }`
 */
export function savePhonePreferences(preferences) {
	try {
		window.localStorage.setItem(GANTT_PHONE_KEY, JSON.stringify(preferences));
	} catch {
		// storage unavailable
	}
}
