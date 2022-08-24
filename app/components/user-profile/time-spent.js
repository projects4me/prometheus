/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

/**
 * This component is used to render time spent by user on issues.
 *
 * @class UserProfileTimeSpentComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
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
     * This property is used to keep track total minutes that 
     * user spent on issues.
     *
     * @property minutes
     * @type Number
     * @for UserProfileTimeSpentComponent
     * @private
     */
    minutes = 0;

    /**
     * This property is used to keep track total hours that 
     * user spent on issues.
     *
     * @property hours
     * @type Number
     * @for UserProfileTimeSpentComponent
     * @private
     */
    hours = 0;

    /**
     * This property is used to keep track total days that 
     * user spent on issues.
     *
     * @property days
     * @type Number
     * @for UserProfileTimeSpentComponent
     * @private
     */
    days = 0;

    /**
     * This property is used to keep track total years that 
     * user spent on issues.
     *
     * @property years
     * @type Number
     * @for UserProfileTimeSpentComponent
     * @private
     */
    years = 0;

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
        _self.minutes = _self.timeSpent;

        /**time according to 8 hours a day */
        const TOTAL_MINUTES_IN_YEAR = 175200;
        const TOTAL_MINUTES_IN_DAY = 480;

        /**set minutes and hours */
        if (_self.minutes >= 60) {
            _self.hours += Math.round(_self.minutes / 60);
            _self.minutes = _self.minutes % 60;
        }

        /**set hour and days */
        if (_self.hours >= 8 || _self.days >= 1) {
            /** suppose we have 5 days and 5 hours.
             * So that value should be shown exactly same*/

            if (_self.hours >= 8) {
                _self.days += Math.floor(_self.hours / 8);
                _self.hours = _self.hours % 8;
            }
        }

        /** set days and years */
        if (_self.days >= 365) {
            _self.years = Math.round(_self.days / 365);
            _self.days = _self.days % 365;
        }

        if (_self.timeSpent >= TOTAL_MINUTES_IN_DAY && _self.timeSpent < TOTAL_MINUTES_IN_YEAR) {
            _self.timeToDisplay('days', _self.days);
            _self.timeToDisplay('hours', _self.hours);
        } else if (_self.timeSpent < TOTAL_MINUTES_IN_DAY) {
            _self.timeToDisplay('hours', _self.hours);
            _self.timeToDisplay('minutes', _self.minutes);
        } else if (_self.timeSpent >= TOTAL_MINUTES_IN_YEAR) {
            _self.timeToDisplay('years', _self.years);
            _self.timeToDisplay('days', _self.days);
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