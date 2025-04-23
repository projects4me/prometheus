/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render time spent by user on issues.
 *
 * @class UserProfileTimeSpentComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfileTimeSpentComponent extends Component {

    /**
     * This property is used to keep track the time. Whenever the value of time
     * is re-calculated in runtime, the component will be re-rendered.
     *
     * @property time
     * @type Array
     * @for UserProfileTimeSpentComponent
     * @private
     */
    @tracked time = [];

    /**
     * This function returns total time logged by user on issues.
     * @method get
     * @public
     */
    get timeSpent() {
        return this.args.timeSpent;
    }

    /**
     * This function is used to calculate time that user has spent on issues. In this 
     * function we're calculating total minutes, hours, days and years and prioritize
     * these to show top 2 times e.g if days, hours and minutes are present so just show 
     * days and hours.
     * 
     * @method calculateTime
     * @public
     */
    calculateTime() {
        let _self = this;
        _self.time = [];
        let minutes, hours, days, years;
        minutes = hours = days = years = 0;

        minutes = _self.timeSpent;
        /**time according to 8 hours a day */
        const TOTAL_MINUTES_IN_YEAR = 175200;
        const TOTAL_MINUTES_IN_DAY = 480;

        /**set minutes and hours */
        if (minutes >= 60) {
            hours += Math.round(minutes / 60);
            minutes = minutes % 60;
        }

        /**set hour and days */
        if (hours >= 8 || days >= 1) {
            /** suppose we have 5 days and 5 hours.
             * So that value should be shown exactly same*/

            if (hours >= 8) {
                days += Math.floor(hours / 8);
                hours = hours % 8;
            }
        }

        /** set days and years */
        if (days >= 365) {
            years = Math.round(days / 365);
            days = days % 365;
        }

        if (_self.timeSpent >= TOTAL_MINUTES_IN_DAY && _self.timeSpent < TOTAL_MINUTES_IN_YEAR) {
            _self.timeToDisplay('days', days);
            _self.timeToDisplay('hours', hours);
        } else if (_self.timeSpent < TOTAL_MINUTES_IN_DAY) {
            _self.timeToDisplay('hours', hours);
            _self.timeToDisplay('minutes', minutes);
        } else if (_self.timeSpent >= TOTAL_MINUTES_IN_YEAR) {
            _self.timeToDisplay('years', years);
            _self.timeToDisplay('days', days);
        }

        // Edge case for the (new) user who has zero spent time on issues.
        if (_self.time.length === 0) {
            _self.timeToDisplay('days', 0);
            _self.timeToDisplay('hours', 0);
        }
    }

    /**
     * This function push object inside 'time' array, that is used inside template
     * to render time spent by user on issues.
     * 
     * @method timeToDisplay
     * @public
     */
    timeToDisplay(key, value) {
        this.time.push({
            key: `views.app.user.page.stats.timespent.${key}`,
            value: ('0' + value).slice(-2)
        })
    }

    /**
     * This function is used to call calculateTime function and return updated time.
     * 
     * @method get
     * @public
     */
    get getTime() {
        this.calculateTime();
        return this.time;
    }
}
