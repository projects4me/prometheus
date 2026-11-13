/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormFieldsComponent from "./form-fields";
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

// Leap year, so 29 February can be chosen.
const REFERENCE_YEAR = 2000;

/**
 * A day and month (no year) field made of two native selects. Value is `DD-MM`.
 *
 * @class FieldDayMonth
 * @namespace Prometheus.Components
 * @extends FormFieldsComponent
 */
export default class FieldDayMonthComponent extends FormFieldsComponent {
    @service intl;

    @tracked day = null;
    @tracked month = null;

    /**
     * Seeds the selected day and month from the DD-MM value. The two parts are
     * kept here because the emitted value stays empty until both are chosen.
     */
    constructor() {
        super(...arguments);
        const parts = String(this.args.value ?? '').split('-');
        if (parts.length === 2) {
            this.day = Number(parts[0]) || null;
            this.month = Number(parts[1]) || null;
        }
    }

    /**
     * Days of the selected month, 1-31 when no month is chosen.
     *
     * @property days
     */
    get days() {
        const last = this.month ? new Date(REFERENCE_YEAR, this.month, 0).getDate() : 31;
        return Array.from({ length: last }, (_, i) => ({ value: i + 1, selected: i + 1 === this.day }));
    }

    /**
     * Month names in the current locale.
     *
     * @property months
     */
    get months() {
        const locale = this.intl.primaryLocale;
        return Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            selected: i + 1 === this.month,
            name: new Date(REFERENCE_YEAR, i, 1).toLocaleString(locale, { month: 'long' })
        }));
    }

    /**
     * Emits DD-MM, or '' until both parts are chosen. A day beyond the
     * month length (31-02) is dropped.
     *
     * @method emit
     * @param {Number|null} day
     * @param {Number|null} month
     */
    emit(day, month) {
        if (month && day > new Date(REFERENCE_YEAR, month, 0).getDate()) {
            day = null;
        }
        this.day = day;
        this.month = month;
        const pad = (n) => String(n).padStart(2, '0');
        this.args.update?.(day && month ? `${pad(day)}-${pad(month)}` : '');
    }

    @action onDayChange(event) {
        this.emit(Number(event.target.value) || null, this.month);
    }

    @action onMonthChange(event) {
        this.emit(this.day, Number(event.target.value) || null);
    }
}
