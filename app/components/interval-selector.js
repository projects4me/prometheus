/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Component from '@glimmer/component';

/**
 * This component adds the functionality of interval selection for the timelog.
 *
 * @class IntervalSelectorComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class IntervalSelectorComponent extends Component {
    /**
     * The number of days selected
     *
     * @property days
     * @type int
     * @for IntervalSelectorComponent
     * @public
     */
    @tracked days = this.args.days || 0;

    /**
     * The number of hours selected
     *
     * @property hours
     * @type int
     * @for IntervalSelectorComponent
     * @public
     */
    @tracked hours = this.args.hours || 0;

    /**
     * The number of minutes selected
     *
     * @property minutes
     * @type int
     * @for IntervalSelectorComponent
     * @public
     */
    @tracked minutes = this.args.minutes || 0;

    /**
     * Updates the days value, capping it at 99 if it exceeds 356
     *
     * @method updateDays
     * @param {Event} event - The input event
     * @public
     */
    @action
    updateDays(event, value) {
        const updateValue = event ? event.target.value : value;
        const days = parseInt(updateValue, 10);
        if (days >= 99) {
            this.days = 99;
        } else {
            this.days = days;
        }
        this.args.update('days', this.days.toString());
    }

    /**
     * Updates the hours value, converting excess hours to days
     *
     * @method updateHours
     * @param {Event} event - The input event
     * @public
     */
    @action
    updateHours(event, value) {
        const updateValue = event ? event.target.value : value;
        const hours = parseInt(updateValue, 10);
        let days = parseInt(this.days, 10);

        if (hours >= 8) {
            days += Math.floor(hours / 8);
            this.updateDays(null, days);
            this.hours = hours % 8;
        } else {
            this.hours = hours;
        }
        this.args.update('hours', this.hours.toString());
    }

    /**
     * Updates the minutes value, converting excess minutes to hours
     *
     * @method updateMinutes
     * @param {Event} event - The input event
     * @public
     */
    @action
    updateMinutes(event, value) {
        const updateValue = event ? event.target.value : value;
        const minutes = parseInt(updateValue, 10);
        let hours = parseInt(this.hours, 10);
        
        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            this.updateHours(null, hours);
            this.minutes = minutes % 60;
        } else {
            this.minutes = minutes;
        }
        this.args.update('minutes', this.minutes.toString());
    }

    /**
     * Calculates the total interval in minutes
     *
     * @property totalMinutes
     * @type Number
     * @readonly
     */
    get totalMinutes() {
        return (this.days * 8 * 60) + (this.hours * 60) + this.minutes;
    }
}
