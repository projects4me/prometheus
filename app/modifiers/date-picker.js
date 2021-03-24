/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import $ from 'jquery';

export default modifier(function datePicker(element, update) {

    //applying daterangepicker on given element
    $(element).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });

    /*Calling update function, which is actually 'selectStatic' function in prometheus.js, and giving it
    selected value of date using daterangepicker in order to set that selected date to model.*/
    $(element).on('apply.daterangepicker', function (ev, picker) {
        update[0](picker.startDate.format('YYYY-MM-DD'));
    });
});
