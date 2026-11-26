/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The one localStorage key of the Gantt toolbar. Its value is JSON: `{ scale, links, otherProjects, weekends }`.
 * `scale` is `days`, `weeks` or `months`; `links` lists the shown link types; the two flags are booleans. The key is per browser, so per user.
 *
 * @property GANTT_TOOLBAR_KEY
 * @type String
 */
export const GANTT_TOOLBAR_KEY = 'gantt-toolbar';

const SCALES = ['days', 'weeks', 'months'];

/**
 * The link types the Links filter offers, in menu order
 *
 * @property LINK_TYPES
 * @type Array
 */
export const LINK_TYPES = ['blocks', 'splits', 'relates'];

/**
 * The link types shown until the user chooses: relates still only appears on hover or select
 *
 * @property DEFAULT_LINK_TYPES
 * @type Array
 */
export const DEFAULT_LINK_TYPES = ['blocks', 'splits'];

/**
 * The saved link types: `links` when it is a list, else the old `dependencies` flag (off = none, on = the defaults)
 *
 * @function savedLinkTypes
 * @param {Object} saved
 * @return {Array}
 */
function savedLinkTypes(saved) {
	if (Array.isArray(saved.links)) {
		return LINK_TYPES.filter((type) => saved.links.includes(type));
	}
	return saved.dependencies === false ? [] : [...DEFAULT_LINK_TYPES];
}

/**
 * Reads the saved toolbar state; anything missing or invalid falls back to Weeks, Blocks and Splits, other projects and weekends on
 *
 * @function loadToolbarPreferences
 * @return {Object} `{ scale, links, otherProjects, weekends }`
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
		links: savedLinkTypes(saved),
		otherProjects: saved.otherProjects !== false,
		weekends: saved.weekends !== false
	};
}

/**
 * Saves the toolbar state; when storage is unavailable the state stays for this session only
 *
 * @function saveToolbarPreferences
 * @param {Object} preferences `{ scale, links, otherProjects, weekends }`
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
