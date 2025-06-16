/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Gantt Timeline Header Component
 * Displays the timeline header with date columns
 *
 * @class GanttTimelineComponent
 * @namespace Prometheus.Components.GanttChart
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class GanttTimelineComponent extends Component {

    /**
     * Get the CSS grid template columns for the timeline
     *
     * @method get gridTemplateColumns
     * @return {String} CSS grid template columns value
     */
    get gridTemplateColumns() {
        if (!this.args.columns) {
            return 'none';
        }

        return this.args.columns
            .map(column => `${column.width}px`)
            .join(' ');
    }

    /**
     * Get today's date for highlighting current day
     *
     * @method get today
     * @return {Date} Today's date
     */
    get today() {
        return new Date();
    }

    /**
     * Check if a column represents today
     *
     * @method isToday
     * @param {Object} column The timeline column
     * @return {Boolean} Whether the column is today
     */
    isToday(column) {
        const today = new Date();
        const columnDate = new Date(column.date);
        
        return today.toDateString() === columnDate.toDateString();
    }

    /**
     * Check if a column is in the past
     *
     * @method isPast
     * @param {Object} column The timeline column
     * @return {Boolean} Whether the column is in the past
     */
    isPast(column) {
        const today = new Date();
        const columnDate = new Date(column.date);
        
        return columnDate < today;
    }

    /**
     * Check if a column is a weekend (Saturday or Sunday)
     *
     * @method isWeekend
     * @param {Object} column The timeline column
     * @return {Boolean} Whether the column is a weekend
     */
    isWeekend(column) {
        const columnDate = new Date(column.date);
        const dayOfWeek = columnDate.getDay();
        
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }

    /**
     * Get CSS classes for a timeline column
     *
     * @method getColumnClasses
     * @param {Object} column The timeline column
     * @return {String} CSS classes
     */
    getColumnClasses(column) {
        const classes = ['gantt-timeline__column'];
        
        if (this.isToday(column)) {
            classes.push('gantt-timeline__column--today');
        }
        
        if (this.isPast(column)) {
            classes.push('gantt-timeline__column--past');
        }
        
        if (this.isWeekend(column)) {
            classes.push('gantt-timeline__column--weekend');
        }
        
        return classes.join(' ');
    }

    /**
     * Handle column click for date selection
     *
     * @method onColumnClick
     * @param {Object} column The clicked column
     */
    @action
    onColumnClick(column) {
        if (this.args.onDateSelect) {
            this.args.onDateSelect(column.date);
        }
    }

    /**
     * Handle column hover for date preview
     *
     * @method onColumnHover
     * @param {Object} column The hovered column
     */
    @action
    onColumnHover(column) {
        if (this.args.onDateHover) {
            this.args.onDateHover(column.date);
        }
    }
}
