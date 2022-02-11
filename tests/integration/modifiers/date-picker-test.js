/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, focus, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | date-picker', function (hooks) {
    setupRenderingTest(hooks);

    test('Single Date Picker', async function (assert) {
        //Removing existing date field that are present on DOM, rendered by some other test case.
        let dateFields = document.querySelectorAll('div.daterangepicker');
        dateFields.forEach((dateField) => {
            dateField.remove();
        });

        await render(hbs`
            <Input
                id="test"
                style="margin-top:10%"
                placeholder="Select end date"
                label="End Date"                                                 
                {{date-picker '' 'YYYY-MM-DD' true true 'right' 'up' true 10 '2021-03-01' '' '' '' '' 1990 2023 true}}
            />
        `);
        await focus('input#test');
        assert.equal(document.querySelector('div.single').getAttribute('class'), 'daterangepicker ltr single opensright show-calendar drop-up', 'Single date picker')
        assert.equal(document.querySelector('th.month > select:first-child').getAttribute('class'), 'monthselect', 'Show drop downs');
        assert.equal(document.querySelector('div.opensright').getAttribute('class'), 'daterangepicker ltr single opensright show-calendar drop-up', 'PositionX')
        assert.equal(document.querySelector('div.drop-up').getAttribute('class'), 'daterangepicker ltr single opensright show-calendar drop-up', 'PositionY')
        assert.equal(document.querySelector('div.calendar-time > select:first-child').getAttribute('class'), 'hourselect', 'Time picker');
        assert.equal(document.querySelector('div.calendar-time > select.minuteselect > option:nth-child(2)').getAttribute('value'), '10', 'Time picker increment');
        assert.equal(document.querySelector('div.drp-buttons > button.applyBtn').getAttribute('class'), 'applyBtn btn btn-sm btn-primary', 'Auto apply');
        assert.equal(document.querySelector('select.yearselect > option').getAttribute('value'), '1990', 'Min year');
        assert.equal(document.querySelector('select.yearselect > option:last-child').getAttribute('value'), '2023', 'Max year');
        await click(document.querySelector('body'));
        document.querySelector('div.single').remove();
    });

    test('Multi Date Picker', async function (assert) {
        this.set('update', (date) => {
            assert.equal(moment(date, 'YYYY-MM-DD,true').isValid(), true, 'Update function and date format validation');
        });

        let hideFunc = () => {
            this.set('isHide', false);
            $('input#test').on('hide.daterangepicker', () => {
                this.isHide = true;
                assert.equal(this.isHide, true, 'Hide event');
            });
        };

        this.set('hide', hideFunc);

        await render(hbs`
            <Input
                id="test"
                style="margin-top:10%"
                placeholder="Select end date"
                label="End Date"                                                 
                {{date-picker this.update 'YYYY-MM-DD' false true '' '' '' '' '2021-03-01' '' '1990-02-13' '2022-11-30' '7' '' '' true}}
            />
        `);
        this.hide();
        await focus('input#test');
        await click(document.querySelector('tbody > tr:nth-child(1) > td.active.start-date.available'));
        assert.equal(document.querySelector('div.show-calendar').getAttribute('class'), 'daterangepicker ltr auto-apply show-calendar opens', 'Multi date picker');
        assert.equal(document.querySelector('td.start-date').innerHTML, '1', 'Start Date');
        assert.equal(document.querySelector('tbody > tr:nth-child(2) > td:nth-child(3)').getAttribute('class'), 'off disabled', 'Max Span');
        assert.equal(document.querySelector('select.yearselect > option').getAttribute('value'), '1990', 'Min year');
        assert.equal(document.querySelector('select.yearselect > option:last-child').getAttribute('value'), '2022', 'Max year');
        await click(document.querySelector('div.daterangepicker > div.left > div.calendar-table > table > tbody > tr:nth-child(2) > td:nth-child(2)'));
    });
});
