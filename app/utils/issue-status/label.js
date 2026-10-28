/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Translation path of the issue status labels.
 *
 * @property ISSUE_STATUS_LABEL_PATH
 * @type String
 * @public
 */
export const ISSUE_STATUS_LABEL_PATH = 'views.app.issue.lists.status';

/**
 * Translation path of the issue type labels.
 *
 * @property ISSUE_TYPE_LABEL_PATH
 * @type String
 * @public
 */
export const ISSUE_TYPE_LABEL_PATH = 'views.app.issue.lists.type';

/**
 * Returns the label of a value kept under a translation path: the translated name so labels
 * stay multi-lingual, or the value itself when it has no translation (one added in Settings).
 *
 * @method valueLabel
 * @param {Ember.Service} intl The intl service
 * @param {String} path Translation path of the labels
 * @param {String} name The value, e.g. `in_progress`
 * @return {String} The label to display
 * @public
 */
export function valueLabel(intl, path, name) {
    let key = `${path}.${name}`;

    return intl.exists(key) ? intl.t(key) : (name || '');
}

/**
 * Returns the label of a record in the current language: the label saved with the record,
 * else its translated name, else its name.
 *
 * @method recordLabel
 * @param {Ember.Service} intl The intl service
 * @param {String} path Translation path of the labels
 * @param {Prometheus.Models.Object} record An issue status or an issue type
 * @return {String} The label to display
 * @public
 */
export function recordLabel(intl, path, record) {
    let saved = record.translations?.[intl.primaryLocale];

    return saved || valueLabel(intl, path, record.name);
}

/**
 * Adds the saved labels of a value to the loaded translations so they show without a reload.
 *
 * @method addLabels
 * @param {Ember.Service} intl The intl service
 * @param {String} path Translation path of the labels
 * @param {String} name The value
 * @param {Object} translations The labels, locale => label
 * @public
 */
export function addLabels(intl, path, name, translations) {
    Object.entries(translations ?? {}).forEach(([locale, label]) => {
        intl.addTranslations(locale, { [`${path}.${name}`]: label });
    });
}

export const issueStatusLabel = (intl, name) => valueLabel(intl, ISSUE_STATUS_LABEL_PATH, name);
export const issueStatusRecordLabel = (intl, status) => recordLabel(intl, ISSUE_STATUS_LABEL_PATH, status);
export const addIssueStatusLabels = (intl, name, translations) => addLabels(intl, ISSUE_STATUS_LABEL_PATH, name, translations);

export const issueTypeLabel = (intl, name) => valueLabel(intl, ISSUE_TYPE_LABEL_PATH, name);
export const issueTypeRecordLabel = (intl, type) => recordLabel(intl, ISSUE_TYPE_LABEL_PATH, type);
export const addIssueTypeLabels = (intl, name, translations) => addLabels(intl, ISSUE_TYPE_LABEL_PATH, name, translations);
