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
 * Returns the label of an issue status: the translated name so labels stay multi-lingual,
 * or the name itself for a status that has no translation (one added in Settings).
 *
 * @method issueStatusLabel
 * @param {Ember.Service} intl The intl service
 * @param {String} name Name of the issue status
 * @return {String} The label to display
 * @public
 */
export function issueStatusLabel(intl, name) {
    let key = `${ISSUE_STATUS_LABEL_PATH}.${name}`;

    return intl.exists(key) ? intl.t(key) : (name || '');
}

/**
 * Returns the label of an issue status record in the current language: the label saved
 * with the status, else its translated name, else its name.
 *
 * @method issueStatusRecordLabel
 * @param {Ember.Service} intl The intl service
 * @param {Prometheus.Models.Issuestatus} status The issue status
 * @return {String} The label to display
 * @public
 */
export function issueStatusRecordLabel(intl, status) {
    let saved = status.translations?.[intl.primaryLocale];

    return saved || issueStatusLabel(intl, status.name);
}

/**
 * Adds the saved labels of an issue status to the loaded translations so they show
 * without a reload.
 *
 * @method addIssueStatusLabels
 * @param {Ember.Service} intl The intl service
 * @param {String} name Name of the issue status
 * @param {Object} translations The labels, locale => label
 * @public
 */
export function addIssueStatusLabels(intl, name, translations) {
    Object.entries(translations ?? {}).forEach(([locale, label]) => {
        intl.addTranslations(locale, { [`${ISSUE_STATUS_LABEL_PATH}.${name}`]: label });
    });
}
