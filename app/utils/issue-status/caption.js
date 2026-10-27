/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The translation key of the caption of a label field in the Add/Edit issue status dialog.
 *
 * @property LABEL_CAPTION_KEY
 * @type String
 */
export const LABEL_CAPTION_KEY = 'views.app.settings.issueStatuses.label';

/**
 * The caption of the label field of a locale. Translating into another locale
 * writes to the intl service, so call this from an action, never while rendering.
 * A locale without the translation gets the default caption with the locale code,
 * so every field's caption stays unique.
 *
 * @method labelCaption
 * @param {Service} intl The ember-intl service
 * @param {String} locale
 * @param {String} defaultLocale
 * @return {String}
 */
export function labelCaption(intl, locale, defaultLocale) {
    if (locale === defaultLocale || intl.exists(LABEL_CAPTION_KEY, locale)) {
        return intl.t(LABEL_CAPTION_KEY, { locale });
    }

    const message = intl.lookup(LABEL_CAPTION_KEY, defaultLocale);

    return message.includes('{locale}') ? message.replace('{locale}', locale) : `${message} (${locale})`;
}
