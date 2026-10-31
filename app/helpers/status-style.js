/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { labelStyle } from 'prometheus/utils/color';

/**
 * Returns the inline style that paints a status label with the colour of the issue status
 * of the given name. When the status is unknown or has no colour it returns an empty string
 * so the CSS class of the status stays as the fallback. Colours that are not a plain colour value are ignored, since the style is rendered as HTML-safe.
 * When it paints the background with a hex colour it also sets the status's text colour: the chosen one,
 * else the one readable on the colour.
 *
 * @class StatusStyle
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper
 */
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|hsl)a?\([\d\s.,%]+\))$/i;

export default class StatusStyleHelper extends Helper {
    @service store;

    /**
     * @method compute
     * @param {Array} params The status name and optionally the CSS property, e.g. `{{status-style issue.status}}`
     * @return {String} The style attribute value
     */
    compute([statusName, property = 'background-color']) {
        let status = this.store.peekAll('issuestatus').find((item) => item.name === statusName && SAFE_COLOR.test(item.color || ''));

        if (!status) {
            return htmlSafe('');
        }

        // A label background also gets a readable text colour.
        let style = property === 'background-color' && labelStyle(status.color, { textColor: status.textColor, important: true });

        return htmlSafe(style || `${property}: ${status.color} !important`);
    }
}
