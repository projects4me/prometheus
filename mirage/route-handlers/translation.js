/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Response } from 'miragejs';
import ENV from 'prometheus/config/environment';

/**
 * The locales Mirage serves translations for.
 */
export const LOCALES = ['en-us'];

/**
 * Gaia's public translation endpoints, outside the api namespace. A locale's
 * document is empty, so the static bundle is used as is; tests override it
 * with `server.get(translationsUrl(locale), ...)`.
 */
export function translationsUrl(locale) {
	let url = `${ENV.api.host}/translations`;
	return locale ? `${url}/${locale}` : url;
}

export function register(server) {
	server.get(translationsUrl(), () => LOCALES);

	server.get(translationsUrl(':locale'), (schema, request) => {
		if (!LOCALES.includes(request.params.locale)) {
			return new Response(404, {}, { errors: [{ title: 'Locale not supported' }] });
		}

		return {};
	});
}
