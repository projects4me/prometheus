/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormFieldsComponent from "./form-fields";
import { action } from '@ember/object';

const DAY_MONTH_FORMAT = 'DD-MM';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date field built on the browser native date input. The picker-only
 * arguments of the old bootstrap-daterangepicker (showDropdowns, positionX/Y,
 * autoApply, parentEl, timePicker*, maxSpan, minYear/maxYear) are ignored.
 * A `DD-MM` format (a date without a year) renders FieldDayMonth instead.
 *
 * @class FieldDate
 * @namespace Prometheus.Components
 * @extends FormFieldsComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FieldDateComponent extends FormFieldsComponent {

    /**
     * True when the field holds a day and month only.
     *
     * @property isDayMonth
     * @type Boolean
     */
    get isDayMonth() {
        return this.args.format === DAY_MONTH_FORMAT;
    }

    /**
     * The native `min` attribute, only set for YYYY-MM-DD values.
     *
     * @property min
     * @type String|undefined
     */
    get min() {
        return ISO_DATE.test(this.args.minDate ?? '') ? this.args.minDate : undefined;
    }

    /**
     * The native `max` attribute, only set for YYYY-MM-DD values.
     *
     * @property max
     * @type String|undefined
     */
    get max() {
        return ISO_DATE.test(this.args.maxDate ?? '') ? this.args.maxDate : undefined;
    }

    /**
     * Reports the chosen date (YYYY-MM-DD, or '' when cleared) to the parent.
     *
     * @method onDateChange
     * @param {Event} event
     */
    @action onDateChange(event) {
        this.args.update?.(event.target.value);
    }
}
