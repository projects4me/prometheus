/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import $ from 'jquery';

/**
 * This modifier will be called on the creation of date field component in order to
 * attach date range picker
 *
 * @namespace Prometheus.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default modifier(function datePicker(element, [update, format, singleDatePicker, showDropdowns, positionX, positionY, timePicker, timePickerIncrement, startDate, endDate, minDate, maxDate, maxSpan, minYear, maxYear, autoApply, parentEl]) {
    //applying daterangepicker on given element
    $(element).daterangepicker({
        singleDatePicker: singleDatePicker,
        showDropdowns: showDropdowns,
        autoUpdateInput: false,
        opens: positionX,
        drops: positionY,
        timePicker: timePicker,
        timePickerIncrement: timePickerIncrement,
        startDate: startDate,
        endDate: endDate,
        minDate: minDate,
        maxDate: maxDate,
        parentEl: parentEl,
        maxSpan: {
            days: maxSpan
        },
        minYear: minYear,
        maxYear: maxYear,
        autoApply: autoApply,
        locale: {
            format: format
        }
    });

    /*Calling update function, which is actually 'selectStatic' function in prometheus.js, and giving it
    selected value of date using daterangepicker in order to set that selected date to model.*/
    if (singleDatePicker) {
        $(element).on('apply.daterangepicker', function (ev, picker) {
            update(picker.startDate.format(picker.locale.format));
        });
    } else {
        $(element).on('apply.daterangepicker', function (ev, picker) {
            update(picker.startDate.format(picker.locale.format));
        });
        $(element).on('apply.daterangepicker', function (ev, picker) {
            update(picker.endDate.format(picker.locale.format));
        });
    }
});
