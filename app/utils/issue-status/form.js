/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { toLabelValue } from 'prometheus/utils/issue-status/value';
import { isHexColor } from 'prometheus/utils/color';

/**
 * The colour a new status starts with.
 *
 * @property DEFAULT_STATUS_COLOR
 * @type String
 */
export const DEFAULT_STATUS_COLOR = '#80b5d3';

/**
 * The label of an issue status in one locale, as typed in the form.
 *
 * @class IssueStatusLabelField
 * @namespace Prometheus.Utils
 */
export class IssueStatusLabelField {

    /**
     * The locale of the label, e.g. `en-us`
     *
     * @property locale
     * @type String
     * @public
     */
    locale;

    /**
     * Whether the status can't be saved without this label
     *
     * @property required
     * @type Boolean
     * @public
     */
    required;

    /**
     * The label as typed
     *
     * @property text
     * @type String
     * @public
     */
    @tracked text;

    /**
     * The caption of the field, worked out when the dialog opens
     *
     * @property caption
     * @type String
     * @public
     */
    caption;

    constructor(locale, text, required, caption = locale) {
        this.locale = locale;
        this.caption = caption;
        this.text = text ?? '';
        this.required = required;
    }
}

/**
 * The draft of the Add/Edit issue status form: a label per supported locale, the
 * status value and its colour. Until the user edits it, the value of a new status is suggested from
 * the label of the default locale.
 *
 * @class IssueStatusForm
 * @namespace Prometheus.Utils
 */
export default class IssueStatusForm {

    /**
     * One label field per supported locale, the default locale first
     *
     * @property labels
     * @type Array
     * @public
     */
    labels;

    /**
     * Whether the value can still change, only before the status is created
     *
     * @property isValueEditable
     * @type Boolean
     * @public
     */
    isValueEditable;

    /**
     * The value the user typed, null while it is suggested from the default label
     *
     * @property typedValue
     * @type String
     * @private
     */
    @tracked typedValue = null;

    /**
     * The labels the status was opened with, locale => label
     *
     * @property savedTranslations
     * @type Object
     * @private
     */
    savedTranslations;

    /**
     * The colour as typed in the hex field
     *
     * @property typedColor
     * @type String
     * @private
     */
    @tracked typedColor;

    /**
     * The last valid colour, what the colour picker shows while the hex field holds an invalid one
     *
     * @property lastValidColor
     * @type String
     * @private
     */
    @tracked lastValidColor;

    /**
     * @method constructor
     * @param {Object} options
     * @param {Array} options.locales The supported locales
     * @param {String} options.defaultLocale The locale whose label is required
     * @param {Object} options.translations The saved labels, locale => label
     * @param {String} options.value The saved value, empty for a new status
     * @param {Boolean} options.isNew Whether the status is not created yet
     * @param {String} options.color The saved colour, the default colour when it is empty or not a hex colour
     * @param {Function} options.captionFor Gives the caption of a locale's field, the locale code by default
     */
    constructor({ locales, defaultLocale, translations = {}, value = '', isNew = true, color = null, captionFor = (locale) => locale }) {
        let ordered = [defaultLocale, ...locales.filter((locale) => locale !== defaultLocale)];

        this.labels = ordered.map(
            (locale) => new IssueStatusLabelField(locale, translations[locale], locale === defaultLocale, captionFor(locale))
        );
        this.isValueEditable = isNew;
        this.savedTranslations = this.translations;
        this.color = isHexColor(color) ? color.toLowerCase() : DEFAULT_STATUS_COLOR;

        if (!isNew) {
            this.typedValue = value ?? '';
        }
    }

    /**
     * The label of the default locale, the one a status can't be saved without
     *
     * @property defaultLabel
     * @type String
     * @public
     */
    get defaultLabel() {
        return this.labels[0].text.trim();
    }

    /**
     * The status value: the typed one, else the one suggested from the default label
     *
     * @property name
     * @type String
     * @public
     */
    get name() {
        return this.typedValue ?? toLabelValue(this.defaultLabel);
    }

    set name(text) {
        if (this.isValueEditable) {
            this.typedValue = toLabelValue(text);
        }
    }

    /**
     * The labels to save, locale => label; empty labels are left out
     *
     * @property translations
     * @type Object
     * @public
     */
    get translations() {
        return this.labels.reduce((translations, field) => {
            let text = field.text.trim();
            if (text) {
                translations[field.locale] = text;
            }
            return translations;
        }, {});
    }

    /**
     * Whether a label was added, changed or cleared since the form was opened
     *
     * @property labelsChanged
     * @type Boolean
     * @public
     */
    get labelsChanged() {
        let saved = this.savedTranslations;
        let current = this.translations;
        let locales = new Set([...Object.keys(saved), ...Object.keys(current)]);

        return [...locales].some((locale) => saved[locale] !== current[locale]);
    }

    /**
     * The colour as typed in the hex field, e.g. `#80b5d3`. Setting it remembers it when it is valid.
     *
     * @property color
     * @type String
     * @public
     */
    get color() {
        return this.typedColor;
    }

    set color(text) {
        this.typedColor = (text ?? '').trim();
        if (isHexColor(this.typedColor)) {
            this.lastValidColor = this.typedColor.toLowerCase();
        }
    }

    /**
     * The colour the picker shows: the typed colour when it is valid, else the last valid one.
     * Picking a colour types it in the hex field.
     *
     * @property pickerColor
     * @type String
     * @public
     */
    get pickerColor() {
        return this.lastValidColor;
    }

    set pickerColor(color) {
        this.color = color;
    }

    /**
     * The colour to save, lowercase, null while the typed colour is not a hex colour
     *
     * @property colorValue
     * @type String
     * @public
     */
    get colorValue() {
        return isHexColor(this.color) ? this.color.toLowerCase() : null;
    }
}
