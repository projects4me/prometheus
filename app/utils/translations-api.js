/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Requests for Gaia's public translation endpoints (no token, not Ember Data):
 *  - GET /translations           the supported locales, e.g. `["en-us"]`
 *  - GET /translations/{locale}  the nested translation document of a locale; 404 when unsupported
 *
 * Both reject on an HTTP error or a network failure; the caller decides the fallback.
 *
 * @module Utils.TranslationsApi
 */

import ENV from 'prometheus/config/environment';

/**
 * How long a request may take before it is aborted: the app waits for the
 * translations before it renders, so a stalled Gaia must not stall the boot.
 */
export const REQUEST_TIMEOUT_MS = 5000;

/**
 * Builds the URL of a translation endpoint.
 *
 * @param {String} [locale] The locale, omitted for the list of locales
 * @return {String}
 */
function buildTranslationsUrl(locale) {
	let url = `${ENV.api.host}/translations`;
	return locale ? `${url}/${encodeURIComponent(locale)}` : url;
}

/**
 * GETs a translation endpoint and parses its JSON body; aborts after
 * {@link REQUEST_TIMEOUT_MS}.
 *
 * @param {String} url
 * @return {Promise<*>}
 */
async function getJson(url) {
	let controller = new AbortController();
	let timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		let response = await fetch(url, { signal: controller.signal });
		if (!response.ok) {
			throw new Error(`GET ${url} failed (HTTP ${response.status})`);
		}
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Loads the locales the backend has translations for.
 *
 * @return {Promise<Array<String>>}
 */
export async function fetchLocales() {
	let locales = await getJson(buildTranslationsUrl());
	if (!Array.isArray(locales)) {
		throw new Error('GET /translations did not return a list of locales');
	}
	return locales;
}

/**
 * Loads the nested translation document of one locale.
 *
 * @param {String} locale e.g. `en-us`
 * @return {Promise<Object>}
 */
export async function fetchTranslations(locale) {
	let translations = await getJson(buildTranslationsUrl(locale));
	if (translations == null || typeof translations !== 'object' || Array.isArray(translations)) {
		throw new Error(`GET /translations/${locale} did not return a translation document`);
	}
	return translations;
}
