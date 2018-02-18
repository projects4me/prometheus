/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { observer } from '@ember/object';
import { on } from "@ember/object/evented";
import Component from '@ember/component';

/**
 * This class adds the functionality of dropdown action menu in the system
 * In order to allow capturing of an event of any specified name we are passing
 * all incoming actions over to the controller.
 *
 * @class IntervalSelector
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The number of days selected
     *
     * @property days
     * @type int
     * @for IntervalSelector
     * @public
     */
    days: 0,

    /**
     * The number of hours selected
     *
     * @property hours
     * @type int
     * @for IntervalSelector
     * @public
     */
    hours: 0,

    /**
     * The number of minutes selected
     *
     * @property minutes
     * @type int
     * @for IntervalSelector
     * @public
     */
    minutes: 0,

    /**
     * This is the observer function that is called when the
     * days are changed
     *
     * @method daysDidChange
     * @public
     */
    daysDidChange: on('init', observer('days', function() {
        Logger.debug('Prometheus.Components.IntervalSelector->daysDidChange');

        let _self = this;
        let days = _self.get('days');

        if (days >= 356)
        {
            _self.set('days',99);
        }

        Logger.debug('-Prometheus.Components.IntervalSelector->daysDidChange');
    })),

    /**
     * This is the observer function that is called when the
     * hours are changed
     *
     * @method hoursDidChange
     * @public
     */
    hoursDidChange: on('init', observer('hours', function() {
        Logger.debug('Prometheus.Components.IntervalSelector->hoursDidChange');

        let _self = this;
        let hours = _self.get('hours');
        let days = _self.get('days');

        if (hours >= 8)
        {
            _self.set('days',days+Math.floor(hours/8));
            _self.set('hours',hours%8);
        }

        Logger.debug('-Prometheus.Components.IntervalSelector->hoursDidChange');
    })),

    /**
     * This is the observer function that is called when the
     * minutes are changed
     *
     * @method minutesDidChange
     * @public
     */
    minutesDidChange: on('init', observer('minutes', function() {
        Logger.debug('Prometheus.Components.IntervalSelector->minutesDidChange');

        let _self = this;
        let minutes = _self.get('minutes');
        let hours = _self.get('hours');

        if (minutes >= 60)
        {
            _self.set('hours',hours+Math.floor(minutes/60));
            _self.set('minutes',minutes%60);
        }
        Logger.debug('-Prometheus.Components.IntervalSelector->minutesDidChange');
    })),
});
