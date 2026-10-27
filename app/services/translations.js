/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Logger from 'js-logger';
import { fetchLocales, fetchTranslations } from 'prometheus/utils/translations-api';

/**
 * Owns the app's translations: the locales Gaia supports and the active
 * locale. The static bundle (`translations/*.json`) is loaded first; the
 * backend document of a locale is merged over it, so backend values win.
 * When the backend can't be reached the static `en-us` translations stay in
 * use and the app still boots.
 *
 * @class TranslationsService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class TranslationsService extends Service {
	/**
	 * The ember-intl service
	 *
	 * @property intl
	 * @type Service
	 * @private
	 */
	@service intl;

	/**
	 * The locale the app falls back to: its static bundle ships with the app.
	 *
	 * @property defaultLocale
	 * @type String
	 * @public
	 */
	defaultLocale = 'en-us';

	/**
	 * The locales Gaia supports, e.g. `['en-us']`. Forms that need a field
	 * per locale read this list.
	 *
	 * @property locales
	 * @type Array
	 * @public
	 */
	@tracked locales = [this.defaultLocale];

	/**
	 * Sets the default locale, which the static bundle always provides.
	 *
	 * @method useDefaultLocale
	 * @public
	 */
	useDefaultLocale() {
		this.intl.setLocale(this.defaultLocale);
	}

	/**
	 * Boot step, before the app renders: loads the supported locales and the
	 * backend translations of the default locale. Never rejects.
	 *
	 * @method load
	 * @return {Promise}
	 * @public
	 */
	async load() {
		this.useDefaultLocale();
		await Promise.all([this.loadLocales(), this.loadLocale(this.defaultLocale)]);
	}

	/**
	 * Switches to the user's language when Gaia supports it, otherwise to the
	 * default locale. Never rejects.
	 *
	 * @method useLanguageOf
	 * @param {Object} user The signed-in user
	 * @return {Promise}
	 * @public
	 */
	async useLanguageOf(user) {
		let locale = this.localeFor(user?.language);
		if (this.intl.primaryLocale === locale) {
			return;
		}

		if (locale === this.defaultLocale || !(await this.loadLocale(locale))) {
			this.useDefaultLocale();
			return;
		}
		this.intl.setLocale(locale);
	}

	/**
	 * Picks the supported locale for a language: the exact locale (`de-de`),
	 * else the first supported locale of the same language (`de` → `de-de`),
	 * else the default locale.
	 *
	 * @method localeFor
	 * @param {String} language The user's language, e.g. `en` or `en-us`
	 * @return {String}
	 * @public
	 */
	localeFor(language) {
		let wanted = String(language ?? '').trim().toLowerCase();
		if (!wanted) {
			return this.defaultLocale;
		}

		return (
			this.locales.find((locale) => locale === wanted) ??
			this.locales.find((locale) => locale.split('-')[0] === wanted.split('-')[0]) ??
			this.defaultLocale
		);
	}

	/**
	 * Loads the supported locales; keeps the current list on failure.
	 *
	 * @method loadLocales
	 * @return {Promise}
	 * @private
	 */
	async loadLocales() {
		try {
			let locales = (await fetchLocales()).map((locale) => String(locale).toLowerCase());
			this.locales = locales.includes(this.defaultLocale) ? locales : [this.defaultLocale, ...locales];
		} catch (error) {
			Logger.warn('TranslationsService::loadLocales - keeping the default locale', error);
		}
		this.warmUp();
	}

	/**
	 * Creates the formatter of every supported locale. ember-intl creates it on the
	 * first use of a locale and stores it in a tracked property, which must not
	 * happen while rendering. A failing locale is logged and skipped.
	 *
	 * @method warmUp
	 * @private
	 */
	warmUp() {
		for (let locale of this.locales) {
			try {
				this.intl.formatNumber(0, { locale });
			} catch (error) {
				Logger.warn(`TranslationsService::warmUp - could not prepare ${locale}`, error);
			}
		}
	}

	/**
	 * Merges the backend translations of a locale over the ones already
	 * loaded for it.
	 *
	 * @method loadLocale
	 * @param {String} locale
	 * @return {Promise<Boolean>} true when the backend translations were merged
	 * @private
	 */
	async loadLocale(locale) {
		try {
			this.intl.addTranslations(locale, await fetchTranslations(locale));
			return true;
		} catch (error) {
			Logger.warn(`TranslationsService::loadLocale - no backend translations for ${locale}`, error);
			return false;
		}
	}
}
