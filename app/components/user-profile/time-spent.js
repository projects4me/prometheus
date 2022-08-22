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
     * This function is called on the initialization of component. In this 
     * function we're calling calculateTime function in order to calculate
     * the time that user has spent on issues.
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.calculateTime();
    }

    /**
     * This function returns total issues of user.
     * @method get
     * @public
     */
    get issues() {
        return this.args.issues;
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
        let showHourAndMin = false;
        let showDayAndHour = false;
        let showYearAndDay = false;

        this.issues.forEach((issue) => {
            issue.spent.forEach((timeSpent) => {
                _self.minutes += Number(timeSpent.minutes);
                _self.hours += Number(timeSpent.hours);
                _self.days += Number(timeSpent.days);
            });
        });

        /**set minutes and hours */
        if (_self.minutes >= 60) {
            _self.hours += Math.round(_self.minutes / 60);
            _self.minutes = _self.minutes % 60;
            showHourAndMin = true;
        }

        /**set hour and days */
        if (_self.hours >= 8 || _self.days >= 1) {
            /** suppose we have 5 days and 5 hours.
             * So that value should be shown exactly same*/

            if (_self.hours >= 8) {
                _self.days += Math.floor(_self.hours / 8);
                _self.hours = _self.hours % 8;
            }
            showHourAndMin = false;
            showDayAndHour = true;
        }

        /** set days and years */
        if (_self.days >= 365) {
            _self.years = Math.round(_self.days / 365);
            _self.days = _self.days % 365;
            showDayAndHour = false;
            showYearAndDay = true;
        }

        if (showDayAndHour) {
            _self.timeToDisplay('Days', _self.days);
            _self.timeToDisplay('Hours', _self.hours);
        } else if (showHourAndMin) {
            _self.timeToDisplay('Hours', _self.hours);
            _self.timeToDisplay('Minutes', _self.minutes);
        } else if (showYearAndDay) {
            _self.timeToDisplay('Years', _self.years);
            _self.timeToDisplay('Days', _self.days);
        } else {
            _self.timeToDisplay('Hours', _self.hours);
            _self.timeToDisplay('Minutes', _self.minutes);
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
            key: key,
            value: ('0' + value).slice(-2)
        })
    }
}
