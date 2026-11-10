/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { htmlSafe, isHTMLSafe } from '@ember/template';
import { formatMessage } from 'prometheus/utils/intl/message-format';
import bundledTranslations from 'prometheus/utils/intl/bundled-translations';

const ESCAPED = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;', '=': '&#x3D;' };

/**
 * Escapes the HTML special characters of a string.
 *
 * @method escapeExpression
 * @param {String} value
 * @return {String}
 * @private
 */
function escapeExpression(value) {
    return value.replace(/[&<>"'`=]/g, (c) => ESCAPED[c]);
}

/**
 * Escapes the string values of `t` options; `htmlSafe` values are inserted as they are.
 *
 * @method escapeOptions
 * @param {Object} options
 * @return {Object}
 * @private
 */
function escapeOptions(options) {
    const escaped = {};
    Object.keys(options).forEach((key) => {
        const value = options[key];
        if (isHTMLSafe(value)) {
            escaped[key] = value.toHTML();
        } else if (typeof value === 'string') {
            escaped[key] = escapeExpression(value);
        } else {
            escaped[key] = value;
        }
    });
    return escaped;
}

/**
 * `en_US` and `EN-US` both become `en-us`.
 *
 * @method normalizeLocale
 * @param {String} locale
 * @return {String}
 * @public
 */
export function normalizeLocale(locale) {
    return String(locale).replace(/_/g, '-').toLowerCase();
}

/**
 * @method toArray
 * @param {String|Array} locale
 * @return {Array}
 * @private
 */
function toArray(locale) {
    return Array.isArray(locale) ? locale : [locale];
}

/**
 * `{ a: { b: 'x' } }` becomes `{ 'a.b': 'x' }` (arrays too, by index).
 *
 * @method flattenKeys
 * @param {Object} object Nested translations
 * @return {Object} Translations keyed by their dotted path
 * @public
 */
export function flattenKeys(object) {
    const result = {};
    for (const key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key)) {
            continue;
        }
        const value = object[key];
        if (value && typeof value === 'object') {
            const nested = flattenKeys(value);
            for (const suffix in nested) {
                result[`${key}.${suffix}`] = nested[suffix];
            }
        } else if (typeof value !== 'undefined') {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Translations and locale-aware formatting on the browser's Intl APIs. Keeps
 * the API Prometheus used from ember-intl: `t`, `exists`, `lookup`,
 * `setLocale`, `addTranslations`, `translationsFor`, `locale`,
 * `primaryLocale`, `locales`, `formatNumber`, `formatDate`, `formatMessage`.
 * The static bundle (`translations/*.json`) is loaded on creation.
 *
 * @class IntlService
 * @namespace Prometheus.Services
 * @extends Service
 * @public
 */
export default class IntlService extends Service {
    /**
     * The active locales, most preferred first.
     *
     * @property _locale
     * @type Array
     * @private
     */
    @tracked _locale = ['en-us'];

    /**
     * The flat messages of each locale: `{ locale: { key: message } }`.
     *
     * @property _messages
     * @type Object
     * @private
     */
    @tracked _messages = {};

    constructor() {
        super(...arguments);
        bundledTranslations.forEach(([locale, translations]) => this.addTranslations(locale, translations));
    }

    /**
     * The active locales; setting it calls `setLocale`.
     *
     * @property locale
     * @type Array
     * @public
     */
    get locale() {
        return this._locale;
    }

    set locale(locale) {
        this.setLocale(locale);
    }

    /**
     * The first active locale.
     *
     * @property primaryLocale
     * @type String
     * @public
     */
    get primaryLocale() {
        return this._locale[0];
    }

    /**
     * The locales that have translations.
     *
     * @property locales
     * @type Array
     * @public
     */
    get locales() {
        return Object.keys(this._messages);
    }

    /**
     * Activates a locale (or a list of them) and sets `<html lang>`.
     *
     * @method setLocale
     * @param {String|Array} locale
     * @public
     */
    setLocale(locale) {
        const proposed = toArray(locale).map(normalizeLocale);
        if (proposed.toString() !== this._locale.toString()) {
            this._locale = proposed;
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('lang', proposed[0]);
            }
        }
        if (!this._messages[proposed[0]]) {
            this._messages = { ...this._messages, [proposed[0]]: {} };
        }
    }

    /**
     * Merges translations into a locale; new values replace existing keys.
     *
     * @method addTranslations
     * @param {String} locale
     * @param {Object} payload Nested translations
     * @public
     */
    addTranslations(locale, payload) {
        const name = normalizeLocale(locale);
        this._messages = {
            ...this._messages,
            [name]: { ...(this._messages[name] || {}), ...flattenKeys(payload) },
        };
    }

    /**
     * @method translationsFor
     * @param {String} locale
     * @return {Object|undefined} The flat messages of the locale
     * @public
     */
    translationsFor(locale) {
        return this._messages[normalizeLocale(locale)];
    }

    /**
     * @method exists
     * @param {String} key
     * @param {String|Array} [locale] The active locales by default
     * @return {Boolean} whether one of the locales has the key
     * @public
     */
    exists(key, locale) {
        return this._localesFor(locale).some((name) => key in (this._messages[name] || {}));
    }

    /**
     * The raw message of a key, from the first locale that has it. A missing
     * key returns the missing-translation text, or `undefined` when `resilient`.
     *
     * @method lookup
     * @param {String} key
     * @param {String|Array} [locale] The active locales by default
     * @param {Object} [options] `resilient: true` to return undefined when missing
     * @return {String|undefined}
     * @public
     */
    lookup(key, locale, options = {}) {
        const names = this._localesFor(locale);
        for (const name of names) {
            const message = this._messages[name]?.[key];
            if (message !== undefined) {
                return message;
            }
        }
        if (options.resilient === true) {
            return undefined;
        }
        warn(`[intl] translation: "${key}" on locale: "${names.join(', ')}" was not found.`, false, {
            id: 'intl-missing-translation',
        });
        return `Missing translation "${key}" for locale "${names.join(', ')}"`;
    }

    /**
     * Translates a key.
     *
     * @method t
     * @param {String} key
     * @param {Object} [options] Placeholder values, plus `default` (fallback
     *   key or keys), `locale` and `htmlSafe` (escape values, return SafeString)
     * @return {String|SafeString}
     * @public
     */
    t(key, options = {}) {
        let keys = [key];
        if (Array.isArray(options.default)) {
            keys = [...keys, ...options.default];
        } else if (typeof options.default === 'string') {
            keys = [...keys, options.default];
        }

        for (let index = 0; index < keys.length; index++) {
            const message = this.lookup(keys[index], options.locale, {
                resilient: keys.length - 1 !== index,
            });
            if (message === '' || typeof message === 'number') {
                return message;
            }
            if (message) {
                return this.formatMessage(message, options);
            }
        }
    }

    /**
     * Formats an ICU message.
     *
     * @method formatMessage
     * @param {String} message
     * @param {Object} [options] Placeholder values, plus `locale` and `htmlSafe`
     * @return {String|SafeString}
     * @public
     */
    formatMessage(message, options = {}) {
        const locale = options.locale ? toArray(options.locale).map(normalizeLocale)[0] : this.primaryLocale;
        const values = options.htmlSafe ? escapeOptions(options) : options;
        const result = formatMessage(String(message), values, locale);
        return options.htmlSafe ? htmlSafe(result) : result;
    }

    /**
     * @method formatNumber
     * @param {Number} value
     * @param {Object} [options] `Intl.NumberFormat` options, plus `locale`
     * @return {String}
     * @public
     */
    formatNumber(value, options = {}) {
        const { locale, ...format } = options;
        return new Intl.NumberFormat(locale ? normalizeLocale(locale) : this.primaryLocale, format).format(value);
    }

    /**
     * @method formatDate
     * @param {Date|Number|String} value
     * @param {Object} [options] `Intl.DateTimeFormat` options, plus `locale`
     * @return {String}
     * @public
     */
    formatDate(value, options = {}) {
        const { locale, ...format } = options;
        return new Intl.DateTimeFormat(locale ? normalizeLocale(locale) : this.primaryLocale, format).format(
            new Date(value)
        );
    }

    /**
     * @method _localesFor
     * @param {String|Array} [locale]
     * @return {Array} The given locales normalised, or the active ones
     * @private
     */
    _localesFor(locale) {
        return locale ? toArray(locale).map(normalizeLocale) : this._locale;
    }
}
