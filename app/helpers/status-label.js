/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { issueStatusLabel } from 'prometheus/utils/issue-status/label';

/**
 * Returns the label of an issue status, the translated name or the name when the status
 * has no translation, e.g. `{{status-label issue.status}}`.
 *
 * @class StatusLabel
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper
 */
export default class StatusLabelHelper extends Helper {
    @service intl;

    /**
     * @method compute
     * @param {Array} params The status name
     * @return {String} The label of the status
     */
    compute([statusName]) {
        // Reading the locale recomputes the label when the language changes
        this.intl.locale;

        return issueStatusLabel(this.intl, statusName);
    }
}
