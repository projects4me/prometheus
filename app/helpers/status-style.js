/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';

/**
 * Returns the inline style that paints a status label with the colour of the issue status
 * of the given name. When the status is unknown or has no colour it returns an empty string
 * so the CSS class of the status stays as the fallback.
 *
 * @class StatusStyle
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper
 */
export default class StatusStyleHelper extends Helper {
    @service store;

    /**
     * @method compute
     * @param {Array} params The status name and optionally the CSS property, e.g. `{{status-style issue.status}}`
     * @return {String} The style attribute value
     */
    compute([statusName, property = 'background-color']) {
        let status = this.store.peekAll('issuestatus').find((item) => item.name === statusName && item.color);

        return status ? htmlSafe(`${property}: ${status.color} !important`) : htmlSafe('');
    }
}
