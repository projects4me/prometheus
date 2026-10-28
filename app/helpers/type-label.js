/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { issueTypeLabel, issueTypeRecordLabel } from 'prometheus/utils/issue-status/label';

/**
 * Returns the label of an issue type, the translated name or the name when the type
 * has no translation, e.g. `{{type-label issue.issuetype}}`.
 *
 * @class TypeLabel
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper
 */
export default class TypeLabelHelper extends Helper {
    @service intl;

    /**
     * @method compute
     * @param {Array} params The type record, or its name
     * @return {String} The label of the type
     */
    compute([type]) {
        // Reading the locale recomputes the label when the language changes
        this.intl.locale;

        if (type && typeof type === 'object') {
            // get() because a relationship can be a proxy
            return issueTypeRecordLabel(this.intl, { name: get(type, 'name'), translations: get(type, 'translations') });
        }

        return issueTypeLabel(this.intl, type);
    }
}
