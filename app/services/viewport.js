/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * The widest viewport (in px) still treated as a phone: Bootstrap's xs range,
 * matching the `max-width: 767px` rules in the styles.
 *
 * @property PHONE_MAX_WIDTH
 * @type Number
 * @final
 */
export const PHONE_MAX_WIDTH = 767;

/**
 * Media query that matches phone-sized viewports.
 *
 * @property PHONE_MEDIA_QUERY
 * @type String
 * @final
 */
export const PHONE_MEDIA_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`;

/**
 * Viewport service: a single shared, live check of the screen width.
 * Inject it and read `isPhone`; it updates when the window crosses 768px.
 *
 * @class ViewportService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class ViewportService extends Service {
    /**
     * True while the viewport is phone-sized (below 768px). False when
     * `window.matchMedia` is unavailable.
     *
     * @property isPhone
     * @type Boolean
     * @public
     */
    @tracked isPhone = false;

    query = null;

    constructor() {
        super(...arguments);
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }
        this.query = window.matchMedia(PHONE_MEDIA_QUERY);
        this.isPhone = this.query.matches;
        this.query.addEventListener('change', this.onChange);
    }

    /**
     * Media query change handler.
     *
     * @method onChange
     * @param {MediaQueryListEvent} event
     * @private
     */
    onChange = (event) => {
        this.isPhone = event.matches;
    };

    willDestroy() {
        super.willDestroy(...arguments);
        this.query?.removeEventListener('change', this.onChange);
    }
}
