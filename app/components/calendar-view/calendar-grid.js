/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached } from '@glimmer/tracking';

/**
 * Calendar Grid Component for displaying calendar dates and events
 *
 * @class CalendarGridComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarGridComponent extends Component {
    @service intl;

    @tracked hoveredDate = null;
    @tracked dragOverDate = null;

    /**
     * Get day names for header
     */
    get dayNames() {
        const days = [];
        const baseDate = new Date(2023, 0, 1); // Start with a Sunday
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            
            days.push({
                short: date.toLocaleDateString('en-US', { weekday: 'short' }),
                long: date.toLocaleDateString('en-US', { weekday: 'long' }),
                index: i
            });
        }
        
        return days;
    }

    /**
     * Get filtered day names based on weekend display setting
     */
    get visibleDayNames() {
        if (this.args.showWeekends) {
            return this.dayNames;
        }
        
        // Filter out Saturday (6) and Sunday (0)
        return this.dayNames.filter(day => day.index !== 0 && day.index !== 6);
    }

    /**
     * Get calendar dates organized by weeks for month view
     */
    @cached
    get calendarWeeks() {
        if (this.args.currentView !== 'month') {
            return [];
        }

        const weeks = [];
        const dates = this.getVisibleDates();
        
        for (let i = 0; i < dates.length; i += 7) {
            const week = dates.slice(i, i + 7);
            
            if (!this.args.showWeekends) {
                // Remove Saturday and Sunday
                week.splice(6, 1); // Remove Saturday
                week.splice(0, 1); // Remove Sunday
            }
            
            weeks.push(week);
        }
        
        return weeks;
    }

    /**
     * Get calendar dates for week view
     */
    @cached
    get weekDates() {
        if (this.args.currentView !== 'week') {
            return [];
        }

        const dates = this.getVisibleDates();
        
        if (!this.args.showWeekends) {
            // Filter out weekend days
            return dates.filter(date => {
                const dayOfWeek = date.getDay();
                return dayOfWeek !== 0 && dayOfWeek !== 6;
            });
        }
        
        return dates;
    }

    /**
     * Get the single date for day view
     */
    get dayDate() {
        if (this.args.currentView !== 'day') {
            return null;
        }
        
        return new Date(this.args.currentDate);
    }

    /**
     * Get time slots for day and week views
     */
    get timeSlots() {
        const slots = [];
        
        for (let hour = 0; hour < 24; hour++) {
            slots.push({
                hour,
                label: this.formatHour(hour),
                time: `${hour.toString().padStart(2, '0')}:00`
            });
        }
        
        return slots;
    }

    /**
     * Get visible dates based on current view and settings
     */
    getVisibleDates() {
        if (!this.args.calendarDates) {
            return [];
        }
        
        return this.args.calendarDates;
    }

    /**
     * Format hour for display
     */
    formatHour(hour) {
        const date = new Date();
        date.setHours(hour, 0, 0, 0);
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
    }

    /**
     * Get CSS classes for a date cell
     */
    getDateCellClasses(date) {
        const classes = ['calendar-grid__date-cell'];
        
        // Current month check (for month view)
        if (this.args.currentView === 'month' && !this.args.isCurrentMonth(date)) {
            classes.push('calendar-grid__date-cell--other-month');
        }
        
        // Today check
        if (this.args.isToday(date)) {
            classes.push('calendar-grid__date-cell--today');
        }
        
        // Weekend check
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            classes.push('calendar-grid__date-cell--weekend');
        }
        
        // Hover state
        if (this.hoveredDate && this.isSameDate(date, this.hoveredDate)) {
            classes.push('calendar-grid__date-cell--hovered');
        }
        
        // Drag over state
        if (this.dragOverDate && this.isSameDate(date, this.dragOverDate)) {
            classes.push('calendar-grid__date-cell--drag-over');
        }
        
        // Has events
        const issues = this.args.getIssuesForDate(date);
        const milestones = this.args.getMilestonesForDate(date);
        
        if (issues.length > 0 || milestones.length > 0) {
            classes.push('calendar-grid__date-cell--has-events');
        }
        
        return classes.join(' ');
    }

    /**
     * Check if two dates are the same day
     */
    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
        
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    /**
     * Get events for a specific date and time slot
     */
    getEventsForTimeSlot(date, hour) {
        const issues = this.args.getIssuesForDate(date);
        
        // For now, return all issues for the date
        // In a more advanced implementation, you could filter by time
        return issues;
    }

    /**
     * Handle date cell click
     */
    @action
    handleDateCellClick(date, event) {
        if (this.args.onDateClick) {
            this.args.onDateClick(date, event);
        }
    }

    /**
     * Handle date cell mouse enter
     */
    @action
    handleDateCellMouseEnter(date) {
        this.hoveredDate = date;
    }

    /**
     * Handle date cell mouse leave
     */
    @action
    handleDateCellMouseLeave() {
        this.hoveredDate = null;
    }

    /**
     * Handle drag over
     */
    @action
    handleDragOver(date, event) {
        event.preventDefault();
        this.dragOverDate = date;
        
        if (this.args.onDragOver) {
            this.args.onDragOver(event);
        }
    }

    /**
     * Handle drag leave
     */
    @action
    handleDragLeave() {
        this.dragOverDate = null;
    }

    /**
     * Handle drop
     */
    @action
    handleDrop(date, event) {
        this.dragOverDate = null;
        
        if (this.args.onIssueDrop) {
            this.args.onIssueDrop(date, event);
        }
    }

    /**
     * Handle issue click
     */
    @action
    handleIssueClick(issue, event) {
        if (this.args.onIssueClick) {
            this.args.onIssueClick(issue, event);
        }
    }

    /**
     * Handle issue double click
     */
    @action
    handleIssueDoubleClick(issue, event) {
        if (this.args.onIssueDoubleClick) {
            this.args.onIssueDoubleClick(issue, event);
        }
    }

    /**
     * Handle milestone click
     */
    @action
    handleMilestoneClick(milestone, event) {
        if (this.args.onMilestoneClick) {
            this.args.onMilestoneClick(milestone, event);
        }
    }

    /**
     * Handle issue drag start
     */
    @action
    handleIssueDragStart(issue, event) {
        if (this.args.onIssueDragStart) {
            this.args.onIssueDragStart(issue, event);
        }
    }

    /**
     * Get display text for date
     */
    getDateDisplayText(date) {
        switch (this.args.currentView) {
            case 'day':
                return date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'week':
                return date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric'
                });
            case 'month':
            default:
                return date.getDate().toString();
        }
    }

    /**
     * Check if date cell should be clickable
     */
    isDateCellClickable(date) {
        // Don't allow clicking on other month dates in month view
        if (this.args.currentView === 'month' && !this.args.isCurrentMonth(date)) {
            return false;
        }
        
        return true;
    }

    /**
     * Get maximum events to show in a cell
     */
    get maxEventsPerCell() {
        switch (this.args.currentView) {
            case 'day':
                return 20; // Show many events in day view
            case 'week':
                return 5;  // Moderate number in week view
            case 'month':
            default:
                return 3;  // Limited in month view
        }
    }

    /**
     * Check if there are more events than can be displayed
     */
    hasMoreEvents(date) {
        const issues = this.args.getIssuesForDate(date);
        const milestones = this.args.getMilestonesForDate(date);
        const totalEvents = issues.length + milestones.length;
        
        return totalEvents > this.maxEventsPerCell;
    }

    /**
     * Get count of hidden events
     */
    getHiddenEventsCount(date) {
        const issues = this.args.getIssuesForDate(date);
        const milestones = this.args.getMilestonesForDate(date);
        const totalEvents = issues.length + milestones.length;
        
        return Math.max(0, totalEvents - this.maxEventsPerCell);
    }
}
